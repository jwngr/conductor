import {
  CollectionReference,
  deleteDoc,
  doc,
  limit as firestoreLimit,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import {asyncTry, asyncTryAllPromises} from '@shared/lib/errors';
import {Views} from '@shared/lib/views';

import {
  BaseEventLogItem,
  EventId,
  EventLogItem,
  EventType,
  FeedItemActionEventLogItem,
  FeedSubscriptionEventLogItem,
  makeEventId,
} from '@shared/types/eventLog.types';
import {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import {FeedSubscriptionId} from '@shared/types/feedSubscriptions.types';
import {fromFilterOperator, ViewType} from '@shared/types/query.types';
import {AsyncResult, makeErrorResult, makeSuccessResult, Result} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';
import {Consumer, Unsubscribe} from '@shared/types/utils.types';

import {makeId} from './utils';

export class EventLogService {
  constructor(private readonly eventLogDbRef: CollectionReference) {}

  async getEventLogItem(eventId: EventId): AsyncResult<EventLogItem | null> {
    return asyncTry<EventLogItem | null>(async () => {
      const snapshot = await getDoc(doc(this.eventLogDbRef, eventId));
      return snapshot.exists()
        ? ({...snapshot.data(), eventId: snapshot.id} as EventLogItem)
        : null;
    });
  }

  watchEventLogItem(
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

  watchEventLogItemsQuery(args: {
    readonly viewType: ViewType;
    readonly userId: UserId;
    readonly successCallback: Consumer<EventLogItem[]>;
    readonly errorCallback: Consumer<Error>;
    readonly limit?: number;
  }): Unsubscribe {
    const {viewType, userId, successCallback, errorCallback, limit} = args;

    // Construct Firestore queries from the view config.
    const viewConfig = Views.get(viewType);
    const whereClauses = [
      where('userId', '==', userId),
      ...viewConfig.filters.map((filter) =>
        where(filter.field, fromFilterOperator(filter.op), filter.value)
      ),
    ];
    const itemsQuery = query(
      this.eventLogDbRef,
      ...whereClauses,
      ...(limit ? [firestoreLimit(limit)] : [])
      // TODO: Add order by condition.
      // orderBy(viewConfig.sort.field, fromSortDirection(viewConfig.sort.direction))
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

  async logEvent(eventLogItemResult: Result<EventLogItem>): AsyncResult<EventId | null> {
    if (!eventLogItemResult.success) {
      return eventLogItemResult;
    }

    const eventLogItem = eventLogItemResult.value;
    const eventLogItemDoc = doc(this.eventLogDbRef);

    const addEventLogItemResult = await asyncTryAllPromises<[undefined]>([
      setDoc(eventLogItemDoc, eventLogItem),
    ]);

    if (!addEventLogItemResult.success) {
      return makeErrorResult(addEventLogItemResult.error[0]);
    }

    return makeSuccessResult(eventLogItem.eventId);
  }

  async logFeedItemActionEvent(args: {
    readonly feedItemId: FeedItemId;
    readonly feedItemActionType: FeedItemActionType;
  }): AsyncResult<EventId | null> {
    const eventLogItemResult = makeFeedItemActionEventLogItem(args);
    return this.logEvent(eventLogItemResult);
  }

  async logFeedSubscriptionEvent(args: {
    readonly feedSubscriptionId: FeedSubscriptionId;
  }): AsyncResult<EventId | null> {
    const eventLogItemResult = makeFeedSubscriptionEventLogItem(args);
    return this.logEvent(eventLogItemResult);
  }

  async updateEventLogItem(eventId: EventId, item: Partial<EventLogItem>): AsyncResult<undefined> {
    return asyncTry<undefined>(async () => {
      await updateDoc(doc(this.eventLogDbRef, eventId), item);
    });
  }

  async deleteEventLogItem(eventId: EventId): AsyncResult<undefined> {
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
  readonly feedItemId: FeedItemId;
  readonly feedItemActionType: FeedItemActionType;
}): Result<FeedItemActionEventLogItem> {
  const {feedItemId, feedItemActionType} = args;

  return makeEventLogItem<FeedItemActionEventLogItem>({
    eventType: EventType.FeedItemAction,
    data: {feedItemId, feedItemActionType},
    createdTime: serverTimestamp(),
    lastUpdatedTime: serverTimestamp(),
  });
}

export function makeFeedSubscriptionEventLogItem(args: {
  readonly feedSubscriptionId: FeedSubscriptionId;
}): Result<FeedSubscriptionEventLogItem> {
  const {feedSubscriptionId} = args;

  return makeEventLogItem<FeedSubscriptionEventLogItem>({
    eventType: EventType.FeedSubscription,
    data: {feedSubscriptionId},
    createdTime: serverTimestamp(),
    lastUpdatedTime: serverTimestamp(),
  });
}
