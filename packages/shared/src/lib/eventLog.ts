import {
  CollectionReference,
  deleteDoc,
  doc,
  limit as firestoreLimit,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import {asyncTry} from '@shared/lib/errors';
import {logger} from '@shared/lib/logger';

import {
  EventId,
  EventLogItem,
  EventType,
  FeedItemActionEventLogItem,
  makeEventId,
  UserFeedSubscriptionEventLogItem,
} from '@shared/types/eventLog.types';
import {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import {AsyncResult, makeSuccessResult, Result} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';
import {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import {Consumer, Unsubscribe} from '@shared/types/utils.types';

export class EventLogService {
  constructor(
    private readonly eventLogDbRef: CollectionReference,
    // TODO: This should probably be set via a public method so that it can log events even when
    // logged out.
    private readonly userId: UserId
  ) {}

  public async fetchEventLogItem(eventId: EventId): AsyncResult<EventLogItem | null> {
    return asyncTry<EventLogItem | null>(async () => {
      const snapshot = await getDoc(doc(this.eventLogDbRef, eventId));
      return snapshot.exists()
        ? ({...snapshot.data(), eventId: snapshot.id} as EventLogItem)
        : null;
    });
  }

  public watchEventLogItem(
    eventId: EventId,
    successCallback: Consumer<EventLogItem | null>, // null means event log item does not exist.
    errorCallback: Consumer<Error>
  ): Unsubscribe {
    const unsubscribe = onSnapshot(
      doc(this.eventLogDbRef, eventId),
      (snapshot) => {
        if (snapshot.exists()) {
          successCallback({...snapshot.data(), eventId: snapshot.id} as EventLogItem);
        } else {
          successCallback(null);
        }
      },
      errorCallback
    );
    return () => unsubscribe();
  }

  public watchEventLog(args: {
    readonly successCallback: Consumer<EventLogItem[]>;
    readonly errorCallback: Consumer<Error>;
    readonly limit?: number;
  }): Unsubscribe {
    const {successCallback, errorCallback, limit} = args;

    const itemsQuery = query(
      this.eventLogDbRef,
      where('userId', '==', this.userId),
      ...(limit ? [firestoreLimit(limit)] : []),
      orderBy('createdTime', 'desc')
    );

    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => doc.data() as EventLogItem);
        successCallback(items);
      },
      errorCallback
    );
    return () => unsubscribe();
  }

  public async logEvent(eventLogItemResult: Result<EventLogItem>): AsyncResult<EventId | null> {
    if (!eventLogItemResult.success) {
      return eventLogItemResult;
    }

    const eventLogItem = eventLogItemResult.value;
    const eventLogItemDoc = doc(this.eventLogDbRef, eventLogItem.eventId);

    const addEventLogItemResult = await asyncTry<undefined>(async () => {
      await setDoc(eventLogItemDoc, eventLogItem);
    });

    if (!addEventLogItemResult.success) {
      logger.error(`Failed to log event: ${addEventLogItemResult.error.message}`, {
        eventLogItem,
        error: addEventLogItemResult.error,
      });
      return addEventLogItemResult;
    }

    return makeSuccessResult(eventLogItem.eventId);
  }

  public async logFeedItemActionEvent(args: {
    readonly feedItemId: FeedItemId;
    readonly feedItemActionType: FeedItemActionType;
  }): AsyncResult<EventId | null> {
    const eventLogItemResult = makeFeedItemActionEventLogItem({...args, userId: this.userId});
    return this.logEvent(eventLogItemResult);
  }

  public async logUserFeedSubscriptionEvent(args: {
    readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  }): AsyncResult<EventId | null> {
    const eventLogItemResult = makeUserFeedSubscriptionEventLogItem({...args, userId: this.userId});
    return this.logEvent(eventLogItemResult);
  }

  public async updateEventLogItem(
    eventId: EventId,
    item: Partial<EventLogItem>
  ): AsyncResult<undefined> {
    return asyncTry<undefined>(async () => {
      await updateDoc(doc(this.eventLogDbRef, eventId), item);
    });
  }

  public async deleteEventLogItem(eventId: EventId): AsyncResult<undefined> {
    return asyncTry<undefined>(async () => {
      await deleteDoc(doc(this.eventLogDbRef, eventId));
    });
  }
}

export function makeEventLogItem<T extends EventLogItem>(
  eventLogItemWithoutId: Omit<T, 'eventId'>
): Result<T> {
  const eventIdResult = makeEventId();
  if (!eventIdResult.success) {
    return eventIdResult;
  }

  return makeSuccessResult({...eventLogItemWithoutId, eventId: eventIdResult.value} as T);
}

export function makeFeedItemActionEventLogItem(args: {
  readonly userId: UserId;
  readonly feedItemId: FeedItemId;
  readonly feedItemActionType: FeedItemActionType;
}): Result<FeedItemActionEventLogItem> {
  const {userId, feedItemId, feedItemActionType} = args;

  return makeEventLogItem<FeedItemActionEventLogItem>({
    userId,
    eventType: EventType.FeedItemAction,
    data: {feedItemId, feedItemActionType},
    createdTime: serverTimestamp(),
    lastUpdatedTime: serverTimestamp(),
  });
}

export function makeUserFeedSubscriptionEventLogItem(args: {
  readonly userId: UserId;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}): Result<UserFeedSubscriptionEventLogItem> {
  const {userId, userFeedSubscriptionId} = args;

  return makeEventLogItem<UserFeedSubscriptionEventLogItem>({
    eventType: EventType.UserFeedSubscription,
    userId,
    data: {userFeedSubscriptionId},
    createdTime: serverTimestamp(),
    lastUpdatedTime: serverTimestamp(),
  });
}
