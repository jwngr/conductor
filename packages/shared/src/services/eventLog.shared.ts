import type {CollectionReference, FieldValue} from 'firebase/firestore';
import {
  deleteDoc,
  doc,
  limit as firestoreLimit,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';

import type {
  EventId,
  EventLogItem,
  FeedItemActionEventLogItem,
  UserFeedSubscriptionEventLogItem,
} from '@shared/types/eventLog.types';
import {EventType, makeEventId} from '@shared/types/eventLog.types';
import type {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import type {AsyncResult, Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';

export class SharedEventLogService {
  private readonly eventLogDbRef: CollectionReference;
  private readonly userId: UserId;

  constructor(args: {readonly eventLogDbRef: CollectionReference; readonly userId: UserId}) {
    this.eventLogDbRef = args.eventLogDbRef;
    this.userId = args.userId;
  }

  public async fetchEventLogItem(eventId: EventId): AsyncResult<EventLogItem | null> {
    return asyncTry(async () => {
      const snapshot = await getDoc(doc(this.eventLogDbRef, eventId));
      if (!snapshot.exists()) return null;
      return {...snapshot.data(), eventId: snapshot.id} as EventLogItem;
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

    const addEventLogItemResult = await asyncTry(async () => setDoc(eventLogItemDoc, eventLogItem));

    if (!addEventLogItemResult.success) {
      logger.error(prefixError(addEventLogItemResult.error, 'Failed to log event'), {eventLogItem});
      return addEventLogItemResult;
    }

    return makeSuccessResult(eventLogItem.eventId);
  }

  public async logFeedItemActionEvent(args: {
    readonly feedItemId: FeedItemId;
    readonly feedItemActionType: FeedItemActionType;
    readonly createdTime: FieldValue;
    readonly lastUpdatedTime: FieldValue;
  }): AsyncResult<EventId | null> {
    const eventLogItemResult = makeFeedItemActionEventLogItem({
      userId: this.userId,
      feedItemId: args.feedItemId,
      feedItemActionType: args.feedItemActionType,
      createdTime: args.createdTime,
      lastUpdatedTime: args.lastUpdatedTime,
    });
    return this.logEvent(eventLogItemResult);
  }

  public async logUserFeedSubscriptionEvent(args: {
    readonly userFeedSubscriptionId: UserFeedSubscriptionId;
    readonly createdTime: FieldValue;
    readonly lastUpdatedTime: FieldValue;
  }): AsyncResult<EventId | null> {
    const eventLogItemResult = makeUserFeedSubscriptionEventLogItem({
      userId: this.userId,
      userFeedSubscriptionId: args.userFeedSubscriptionId,
      createdTime: args.createdTime,
      lastUpdatedTime: args.lastUpdatedTime,
    });
    return this.logEvent(eventLogItemResult);
  }

  public async updateEventLogItem(
    eventId: EventId,
    item: Partial<EventLogItem>
  ): AsyncResult<void> {
    return asyncTry(async () => await updateDoc(doc(this.eventLogDbRef, eventId), item));
  }

  public async deleteEventLogItem(eventId: EventId): AsyncResult<void> {
    return asyncTry(async () => await deleteDoc(doc(this.eventLogDbRef, eventId)));
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
  // TODO: These need to be passed in because server and client have different timestamps. Perhaps
  // I should just have separate services for server and client.
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
}): Result<FeedItemActionEventLogItem> {
  const {userId, feedItemId, feedItemActionType, createdTime, lastUpdatedTime} = args;

  return makeEventLogItem<FeedItemActionEventLogItem>({
    userId,
    eventType: EventType.FeedItemAction,
    data: {feedItemId, feedItemActionType},
    createdTime,
    lastUpdatedTime,
  });
}

export function makeUserFeedSubscriptionEventLogItem(args: {
  readonly userId: UserId;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
}): Result<UserFeedSubscriptionEventLogItem> {
  const {userId, userFeedSubscriptionId, createdTime, lastUpdatedTime} = args;

  return makeEventLogItem<UserFeedSubscriptionEventLogItem>({
    eventType: EventType.UserFeedSubscription,
    userId,
    data: {userFeedSubscriptionId},
    createdTime,
    lastUpdatedTime,
  });
}
