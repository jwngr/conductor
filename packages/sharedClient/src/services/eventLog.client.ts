import {limit as firestoreLimit, orderBy, where} from 'firebase/firestore';
import {useEffect, useMemo} from 'react';

import {logger} from '@shared/services/logger.shared';

import {makeUserActor} from '@shared/lib/actors.shared';
import {EVENT_LOG_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {
  makeEventLogItem,
  makeExperimentDisabledEventLogItemData,
  makeExperimentEnabledEventLogItemData,
  makeFeedItemActionEventLogItemData,
  makeStringExperimentValueChangedEventLogItemData,
  makeSubscribedToFeedSourceEventLogItemData,
  makeUnsubscribedFromFeedSourceEventLogItemData,
} from '@shared/lib/eventLog.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {filterNull} from '@shared/lib/utils.shared';

import {
  parseEventId,
  parseEventLogItem,
  toStorageEventLogItem,
} from '@shared/parsers/eventLog.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {AsyncState} from '@shared/types/asyncState.types';
import {Environment} from '@shared/types/environment.types';
import type {EventId, EventLogItem, EventLogItemData} from '@shared/types/eventLog.types';
import type {ExperimentId, ExperimentType} from '@shared/types/experiments.types';
import type {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import type {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';

import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

// TODO: This is a somewhat arbitrary limit. Reconsider what the logic should be here.
const EVENT_LOG_LIMIT = 100;

export const eventLogItemFirestoreConverter = makeFirestoreDataConverter(
  toStorageEventLogItem,
  parseEventLogItem
);

export const useEventLogService = (): ClientEventLogService => {
  const loggedInAccount = useLoggedInAccount();

  const eventLogService = useMemo(() => {
    const eventLogCollectionService = new ClientFirestoreCollectionService({
      collectionPath: EVENT_LOG_DB_COLLECTION,
      converter: eventLogItemFirestoreConverter,
      parseId: parseEventId,
    });

    return new ClientEventLogService({
      environment: Environment.PWA,
      eventLogCollectionService,
      accountId: loggedInAccount.accountId,
    });
  }, [loggedInAccount.accountId]);

  return eventLogService;
};

export function useEventLogItem(eventId: EventId): AsyncState<EventLogItem | null> {
  const eventLogService = useEventLogService();

  const {asyncState, setPending, setError, setSuccess} = useAsyncState<EventLogItem | null>();

  useEffect(() => {
    setPending();
    const unsubscribe = eventLogService.watchById(
      eventId,
      (eventLogItem) => setSuccess(eventLogItem),
      (error) => setError(error)
    );
    return () => unsubscribe();
  }, [eventId, eventLogService, setPending, setError, setSuccess]);

  return asyncState;
}

export function useEventLogItems(): AsyncState<EventLogItem[]> {
  const eventLogService = useEventLogService();

  const {asyncState, setPending, setError, setSuccess} = useAsyncState<EventLogItem[]>();

  useEffect(() => {
    setPending();
    const unsubscribe = eventLogService.watchEventLog({
      successCallback: (eventLogItems) => setSuccess(eventLogItems),
      errorCallback: (error) => setError(error),
      limit: EVENT_LOG_LIMIT,
    });
    return () => unsubscribe();
  }, [eventLogService, setPending, setError, setSuccess]);

  return asyncState;
}

type ClientEventLogCollectionService = ClientFirestoreCollectionService<EventId, EventLogItem>;

export class ClientEventLogService {
  private readonly environment: Environment;
  private readonly eventLogCollectionService: ClientEventLogCollectionService;
  private readonly accountId: AccountId;

  constructor(args: {
    readonly environment: Environment;
    readonly eventLogCollectionService: ClientEventLogCollectionService;
    readonly accountId: AccountId;
  }) {
    this.environment = args.environment;
    this.eventLogCollectionService = args.eventLogCollectionService;
    this.accountId = args.accountId;
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
        where('accountId', '==', this.accountId),
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

  private async logEvent(eventLogItem: EventLogItem): AsyncResult<EventLogItem> {
    const {eventId} = eventLogItem;

    const createResult = await this.eventLogCollectionService.setDoc(eventId, eventLogItem);

    if (!createResult.success) {
      logger.error(prefixError(createResult.error, 'Failed to log event'), {eventLogItem});
      return createResult;
    }

    return makeSuccessResult(eventLogItem);
  }

  private makeEventLogItem(data: EventLogItemData): EventLogItem {
    return makeEventLogItem({
      accountId: this.accountId,
      actor: makeUserActor(this.accountId),
      environment: this.environment,
      data,
    });
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

  //////////////////////////////////////////
  //  BEGIN INDIVIDUAL EVENT LOG HELPERS  //
  //////////////////////////////////////////
  public async logFeedItemActionEvent(args: {
    readonly feedItemId: FeedItemId;
    readonly feedItemActionType: FeedItemActionType;
  }): AsyncResult<EventLogItem> {
    const {feedItemId, feedItemActionType} = args;
    const eventLogItemData = makeFeedItemActionEventLogItemData({feedItemId, feedItemActionType});
    const eventLogItem = this.makeEventLogItem(eventLogItemData);
    return this.logEvent(eventLogItem);
  }

  public async logExperimentEnabledEvent(args: {
    readonly experimentId: ExperimentId;
    readonly experimentType: ExperimentType;
  }): AsyncResult<EventLogItem> {
    const {experimentId, experimentType} = args;
    const eventLogItemData = makeExperimentEnabledEventLogItemData({experimentId, experimentType});
    const eventLogItem = this.makeEventLogItem(eventLogItemData);

    return this.logEvent(eventLogItem);
  }

  public async logExperimentDisabledEvent(args: {
    readonly experimentId: ExperimentId;
    readonly experimentType: ExperimentType;
  }): AsyncResult<EventLogItem> {
    const {experimentId, experimentType} = args;
    const eventLogItemData = makeExperimentDisabledEventLogItemData({experimentId, experimentType});
    const eventLogItem = this.makeEventLogItem(eventLogItemData);

    return this.logEvent(eventLogItem);
  }

  public async logStringExperimentValueChangedEvent(args: {
    readonly experimentId: ExperimentId;
    readonly value: string;
  }): AsyncResult<EventLogItem> {
    const {experimentId, value} = args;
    const eventLogItemData = makeStringExperimentValueChangedEventLogItemData({
      experimentId,
      value,
    });
    const eventLogItem = this.makeEventLogItem(eventLogItemData);

    return this.logEvent(eventLogItem);
  }

  public async logSubscribedToFeedSourceEvent(args: {
    readonly feedSourceType: FeedSourceType;
    readonly userFeedSubscriptionId: UserFeedSubscriptionId;
    readonly isResubscribe: boolean;
  }): AsyncResult<EventLogItem> {
    const {feedSourceType, userFeedSubscriptionId, isResubscribe} = args;
    const eventLogItemData = makeSubscribedToFeedSourceEventLogItemData({
      feedSourceType,
      userFeedSubscriptionId,
      isResubscribe,
    });
    const eventLogItem = this.makeEventLogItem(eventLogItemData);

    return this.logEvent(eventLogItem);
  }

  public async logUnsubscribedFromFeedSourceEvent(args: {
    readonly feedSourceType: FeedSourceType;
    readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  }): AsyncResult<EventLogItem> {
    const {feedSourceType, userFeedSubscriptionId} = args;
    const eventLogItemData = makeUnsubscribedFromFeedSourceEventLogItemData({
      feedSourceType,
      userFeedSubscriptionId,
    });
    const eventLogItem = this.makeEventLogItem(eventLogItemData);

    return this.logEvent(eventLogItem);
  }
  //////////////////////////////////////
  // END INDIVIDUAL EVENT LOG HELPERS //
  //////////////////////////////////////
}
