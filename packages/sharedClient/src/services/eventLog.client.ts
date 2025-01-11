import {limit as firestoreLimit, orderBy, serverTimestamp, where} from 'firebase/firestore';
import {useEffect, useMemo, useState} from 'react';

import {logger} from '@shared/services/logger.shared';

import {EVENT_LOG_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {filterNull} from '@shared/lib/utils.shared';

import {
  parseEventId,
  parseEventLogItem,
  toStorageEventLogItem,
} from '@shared/parsers/eventLog.parser';

import {
  EventType,
  makeEventId,
  type EventId,
  type EventLogItem,
} from '@shared/types/eventLog.types';
import type {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import type {ViewType} from '@shared/types/query.types';
import type {AsyncResult} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';

import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';

import {useLoggedInUser} from '@sharedClient/hooks/auth.hooks';

// TODO: This is a somewhat arbitrary limit. Reconsider what the logic should be here.
const EVENT_LOG_LIMIT = 100;

const eventLogItemFirestoreConverter = makeFirestoreDataConverter(
  toStorageEventLogItem,
  parseEventLogItem
);

export const useEventLogService = () => {
  const loggedInUser = useLoggedInUser();

  const eventLogService = useMemo(() => {
    const eventLogCollectionService = new ClientFirestoreCollectionService({
      collectionPath: EVENT_LOG_DB_COLLECTION,
      converter: eventLogItemFirestoreConverter,
      parseId: parseEventId,
    });

    return new ClientEventLogService({
      eventLogCollectionService,
      userId: loggedInUser.userId,
    });
  }, [loggedInUser.userId]);

  return eventLogService;
};

interface EventLogItemState {
  readonly eventLogItem: EventLogItem | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

// TODO: Ideally these hooks would live in the `shared` package.
export function useEventLogItem(eventId: EventId): EventLogItemState {
  const eventLogService = useEventLogService();

  const [state, setState] = useState<EventLogItemState>({
    eventLogItem: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = eventLogService.watchById(
      eventId,
      (eventLogItem) => setState({eventLogItem, isLoading: false, error: null}),
      (error) => setState({eventLogItem: null, isLoading: false, error})
    );
    return () => unsubscribe();
  }, [eventId, eventLogService]);

  return state;
}

interface EventLogItemsState {
  readonly eventLogItems: EventLogItem[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly limit: number;
}

export function useEventLogItems({viewType}: {readonly viewType: ViewType}): EventLogItemsState {
  const eventLogService = useEventLogService();

  const [state, setState] = useState<EventLogItemsState>({
    eventLogItems: [],
    isLoading: true,
    error: null,
    limit: 0,
  });

  useEffect(() => {
    const unsubscribe = eventLogService.watchEventLog({
      successCallback: (eventLogItems) =>
        setState({eventLogItems, isLoading: false, error: null, limit: EVENT_LOG_LIMIT}),
      errorCallback: (error) =>
        setState({eventLogItems: [], isLoading: false, error, limit: EVENT_LOG_LIMIT}),
    });
    return () => unsubscribe();
  }, [viewType, eventLogService]);

  return state;
}

type ClientEventLogCollectionService = ClientFirestoreCollectionService<EventId, EventLogItem>;

export class ClientEventLogService {
  private readonly eventLogCollectionService: ClientEventLogCollectionService;
  private readonly userId: UserId;

  constructor(args: {
    readonly eventLogCollectionService: ClientEventLogCollectionService;
    readonly userId: UserId;
  }) {
    this.eventLogCollectionService = args.eventLogCollectionService;
    this.userId = args.userId;
  }

  public async fetchById(eventId: EventId): AsyncResult<EventLogItem | null> {
    return this.eventLogCollectionService.fetchById(eventId);
  }

  public watchById(
    eventId: EventId,
    successCallback: Consumer<EventLogItem | null>, // null means event log item does not exist.
    errorCallback: Consumer<Error>
  ): Unsubscribe {
    const unsubscribe = this.eventLogCollectionService.watchDoc(
      eventId,
      successCallback,
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

    const itemsQuery = this.eventLogCollectionService.query(
      filterNull([
        where('userId', '==', this.userId),
        limit ? firestoreLimit(limit) : null,
        orderBy('createdTime', 'desc'),
      ])
    );

    const unsubscribe = this.eventLogCollectionService.watchDocs(
      itemsQuery,
      successCallback,
      errorCallback
    );
    return () => unsubscribe();
  }

  public async logFeedItemActionEvent(args: {
    readonly feedItemId: FeedItemId;
    readonly feedItemActionType: FeedItemActionType;
  }): AsyncResult<EventId | null> {
    const eventId = makeEventId();
    const createResult = await this.eventLogCollectionService.setDoc(eventId, {
      eventId,
      userId: this.userId,
      eventType: EventType.FeedItemAction,
      data: {
        feedItemId: args.feedItemId,
        feedItemActionType: args.feedItemActionType,
      },
      createdTime: serverTimestamp(),
      lastUpdatedTime: serverTimestamp(),
    });

    if (!createResult.success) {
      logger.error(prefixError(createResult.error, 'Failed to log feed item action event'), {
        feedItemId: args.feedItemId,
        feedItemActionType: args.feedItemActionType,
      });
      return createResult;
    }

    return makeSuccessResult(eventId);
  }

  public async logUserFeedSubscriptionEvent(args: {
    readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  }): AsyncResult<EventId | null> {
    const eventId = makeEventId();
    const createResult = await this.eventLogCollectionService.setDoc(eventId, {
      eventId,
      userId: this.userId,
      eventType: EventType.UserFeedSubscription,
      data: {
        userFeedSubscriptionId: args.userFeedSubscriptionId,
      },
      createdTime: serverTimestamp(),
      lastUpdatedTime: serverTimestamp(),
    });

    if (!createResult.success) {
      logger.error(prefixError(createResult.error, 'Failed to log user feed subscription event'), {
        userFeedSubscriptionId: args.userFeedSubscriptionId,
      });
      return createResult;
    }

    return makeSuccessResult(eventId);
  }

  public async updateEventLogItem(
    eventId: EventId,
    item: Partial<Pick<EventLogItem, 'data'>>
  ): AsyncResult<void> {
    const updateResult = await this.eventLogCollectionService.updateDoc(eventId, item);
    return prefixResultIfError(updateResult, 'Error updating event log item');
  }

  public async deleteEventLogItem(eventId: EventId): AsyncResult<void> {
    const deleteResult = await this.eventLogCollectionService.deleteDoc(eventId);
    return prefixResultIfError(deleteResult, 'Error deleting event log item');
  }
}
