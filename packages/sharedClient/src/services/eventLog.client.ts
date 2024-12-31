import {limit as firestoreLimit, orderBy, where} from 'firebase/firestore';
import {useEffect, useMemo, useState} from 'react';

import {
  makeFeedItemActionEventLogItem,
  makeUserFeedSubscriptionEventLogItem,
} from '@shared/services/eventLog.shared';
import {logger} from '@shared/services/logger.shared';

import {EVENT_LOG_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';
import {filterNull} from '@shared/lib/utils.shared';

import {
  parseEventId,
  parseEventLogItem,
  toFirestoreEventLogItem,
} from '@shared/parsers/eventLog.parser';

import type {EventId, EventLogItem} from '@shared/types/eventLog.types';
import type {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import type {ViewType} from '@shared/types/query.types';
import {makeSuccessResult, type AsyncResult, type Result} from '@shared/types/result.types';
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
  toFirestoreEventLogItem,
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

  public async logEvent(eventLogItemResult: Result<EventLogItem>): AsyncResult<EventId | null> {
    if (!eventLogItemResult.success) {
      return eventLogItemResult;
    }

    const eventLogItem = eventLogItemResult.value;
    const createResult = await this.eventLogCollectionService.setDoc(
      eventLogItem.eventId,
      eventLogItem
    );

    if (!createResult.success) {
      logger.error(prefixError(createResult.error, 'Failed to log event'), {eventLogItem});
      return createResult;
    }

    return makeSuccessResult(eventLogItem.eventId);
  }

  public async logFeedItemActionEvent(args: {
    readonly feedItemId: FeedItemId;
    readonly feedItemActionType: FeedItemActionType;
  }): AsyncResult<EventId | null> {
    const eventLogItemResult = makeFeedItemActionEventLogItem({
      userId: this.userId,
      feedItemId: args.feedItemId,
      feedItemActionType: args.feedItemActionType,
    });
    return this.logEvent(eventLogItemResult);
  }

  public async logUserFeedSubscriptionEvent(args: {
    readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  }): AsyncResult<EventId | null> {
    const eventLogItemResult = makeUserFeedSubscriptionEventLogItem({
      userId: this.userId,
      userFeedSubscriptionId: args.userFeedSubscriptionId,
    });
    return this.logEvent(eventLogItemResult);
  }

  public async updateEventLogItem(
    eventId: EventId,
    item: Partial<EventLogItem>
  ): AsyncResult<void> {
    return this.eventLogCollectionService.updateDoc(eventId, item);
  }

  public async deleteEventLogItem(eventId: EventId): AsyncResult<void> {
    return this.eventLogCollectionService.deleteDoc(eventId);
  }
}
