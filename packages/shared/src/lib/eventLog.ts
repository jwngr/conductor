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
import {makeId} from '@shared/lib/utils';

import {
  EventId,
  EventLogItem,
  EventType,
  FeedItemActionEventLogItem,
  FeedSubscriptionEventLogItem,
  makeEventId,
} from '@shared/types/eventLog.types';
import {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import {FeedSubscriptionId} from '@shared/types/feedSubscriptions.types';
import {AsyncResult, makeSuccessResult, Result} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';
import {Consumer, Unsubscribe} from '@shared/types/utils.types';

export class EventLogService {
  constructor(private readonly eventLogDbRef: CollectionReference) {}

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
    readonly userId: UserId;
    readonly successCallback: Consumer<EventLogItem[]>;
    readonly errorCallback: Consumer<Error>;
    readonly limit?: number;
  }): Unsubscribe {
    const {userId, successCallback, errorCallback, limit} = args;

    const itemsQuery = query(
      this.eventLogDbRef,
      where('userId', '==', userId),
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
    // TODO: Store the user ID as state on the instance so that each method call doesn't need to
    // pass it in.
    readonly userId: UserId;
    readonly feedItemId: FeedItemId;
    readonly feedItemActionType: FeedItemActionType;
  }): AsyncResult<EventId | null> {
    const eventLogItemResult = makeFeedItemActionEventLogItem(args);
    return this.logEvent(eventLogItemResult);
  }

  public async logFeedSubscriptionEvent(args: {
    readonly userId: UserId;
    readonly feedSubscriptionId: FeedSubscriptionId;
  }): AsyncResult<EventId | null> {
    const eventLogItemResult = makeFeedSubscriptionEventLogItem(args);
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
  const eventIdResult = makeEventId(makeId());
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

export function makeFeedSubscriptionEventLogItem(args: {
  readonly userId: UserId;
  readonly feedSubscriptionId: FeedSubscriptionId;
}): Result<FeedSubscriptionEventLogItem> {
  const {userId, feedSubscriptionId} = args;

  return makeEventLogItem<FeedSubscriptionEventLogItem>({
    eventType: EventType.FeedSubscription,
    userId,
    data: {feedSubscriptionId},
    createdTime: serverTimestamp(),
    lastUpdatedTime: serverTimestamp(),
  });
}
