import {limit as firestoreLimit, orderBy, where} from 'firebase/firestore';

import {logger} from '@shared/services/logger.shared';

import {makeAccountActor} from '@shared/lib/actors.shared';
import {arrayFilterNull} from '@shared/lib/arrayUtils.shared';
import {EVENT_LOG_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {
  makeEventLogItem,
  makeExperimentDisabledEventLogItemData,
  makeExperimentEnabledEventLogItemData,
  makeFeedItemActionEventLogItemData,
  makeStringExperimentValueChangedEventLogItemData,
  makeSubscribedToFeedEventLogItemData,
  makeThemePreferenceChangedEventLogItemData,
  makeUnsubscribedFromFeedEventLogItemData,
} from '@shared/lib/eventLog.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {parseEventLogItem, parseEventLogItemId} from '@shared/parsers/eventLog.parser';

import type {Environment} from '@shared/types/environment.types';
import type {EventLogItem, EventLogItemData} from '@shared/types/eventLog.types';
import type {ExperimentId, ExperimentType} from '@shared/types/experiments.types';
import type {FeedItemActionType} from '@shared/types/feedItemActions.types';
import type {FeedType} from '@shared/types/feeds.types';
import type {
  AccountId,
  EventLogItemId,
  FeedItemId,
  FeedSubscriptionId,
} from '@shared/types/ids.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {ThemePreference} from '@shared/types/theme.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';

import type {EventLogItemFromStorage} from '@shared/schemas/eventLog.schema';
import {toStorageEventLogItem} from '@shared/storage/eventLog.storage';

import type {ClientFirebaseService} from '@sharedClient/services/firebase.client';
import {makeClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';
import type {ClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';

type ClientEventLogCollectionService = ClientFirestoreCollectionService<
  EventLogItemId,
  EventLogItem,
  EventLogItemFromStorage
>;

export class ClientEventLogService {
  private readonly accountId: AccountId;
  private readonly environment: Environment;
  private readonly collectionService: ClientEventLogCollectionService;

  constructor(args: {
    readonly environment: Environment;
    readonly accountId: AccountId;
    readonly firebaseService: ClientFirebaseService;
  }) {
    this.accountId = args.accountId;
    this.environment = args.environment;

    this.collectionService = makeClientFirestoreCollectionService({
      firebaseService: args.firebaseService,
      collectionPath: EVENT_LOG_DB_COLLECTION,
      toStorage: toStorageEventLogItem,
      fromStorage: parseEventLogItem,
      parseId: parseEventLogItemId,
    });
  }

  public async fetchById(eventLogItemId: EventLogItemId): AsyncResult<EventLogItem | null, Error> {
    return this.collectionService.fetchById(eventLogItemId);
  }

  public watchById(
    eventLogItemId: EventLogItemId,
    successCallback: Consumer<EventLogItem | null>, // null means event log item does not exist.
    errorCallback: Consumer<Error>
  ): Unsubscribe {
    const unsubscribe = this.collectionService.watchDoc(
      eventLogItemId,
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

    const queryClauses = arrayFilterNull([
      where('accountId', '==', this.accountId),
      limit ? firestoreLimit(limit) : null,
      orderBy('createdTime', 'desc'),
    ]);

    const itemsQuery = this.collectionService.query(queryClauses);

    const unsubscribe = this.collectionService.watchDocs(
      itemsQuery,
      successCallback,
      errorCallback
    );
    return () => unsubscribe();
  }

  private async logEvent(eventLogItem: EventLogItem): AsyncResult<EventLogItem, Error> {
    const {eventLogItemId} = eventLogItem;

    const createResult = await this.collectionService.setDoc(eventLogItemId, eventLogItem);

    if (!createResult.success) {
      logger.error(prefixError(createResult.error, 'Failed to log event'), {eventLogItem});
      return createResult;
    }

    return makeSuccessResult(eventLogItem);
  }

  private makeEventLogItem(data: EventLogItemData): EventLogItem {
    return makeEventLogItem({
      accountId: this.accountId,
      actor: makeAccountActor(this.accountId),
      environment: this.environment,
      data,
    });
  }

  public async updateEventLogItem(
    eventLogItemId: EventLogItemId,
    item: Partial<Pick<EventLogItem, 'data'>>
  ): AsyncResult<void, Error> {
    const updateResult = await this.collectionService.updateDoc(eventLogItemId, item);
    return prefixResultIfError(updateResult, 'Error updating event log item');
  }

  public async deleteEventLogItem(eventLogItemId: EventLogItemId): AsyncResult<void, Error> {
    const deleteResult = await this.collectionService.deleteDoc(eventLogItemId);
    return prefixResultIfError(deleteResult, 'Error deleting event log item');
  }

  //////////////////////////////////////////
  //  BEGIN INDIVIDUAL EVENT LOG HELPERS  //
  //////////////////////////////////////////
  public async logFeedItemActionEvent(args: {
    readonly feedItemId: FeedItemId;
    readonly feedItemActionType: FeedItemActionType;
    readonly isUndo: boolean;
  }): AsyncResult<EventLogItem, Error> {
    const {feedItemId, feedItemActionType, isUndo} = args;
    const eventLogItemData = makeFeedItemActionEventLogItemData({
      feedItemId,
      feedItemActionType,
      isUndo,
    });
    const eventLogItem = this.makeEventLogItem(eventLogItemData);
    return this.logEvent(eventLogItem);
  }

  public async logExperimentEnabledEvent(args: {
    readonly experimentId: ExperimentId;
    readonly experimentType: ExperimentType;
  }): AsyncResult<EventLogItem, Error> {
    const {experimentId, experimentType} = args;
    const eventLogItemData = makeExperimentEnabledEventLogItemData({experimentId, experimentType});
    const eventLogItem = this.makeEventLogItem(eventLogItemData);
    return this.logEvent(eventLogItem);
  }

  public async logExperimentDisabledEvent(args: {
    readonly experimentId: ExperimentId;
    readonly experimentType: ExperimentType;
  }): AsyncResult<EventLogItem, Error> {
    const {experimentId, experimentType} = args;
    const eventLogItemData = makeExperimentDisabledEventLogItemData({experimentId, experimentType});
    const eventLogItem = this.makeEventLogItem(eventLogItemData);
    return this.logEvent(eventLogItem);
  }

  public async logStringExperimentValueChangedEvent(args: {
    readonly experimentId: ExperimentId;
    readonly value: string;
  }): AsyncResult<EventLogItem, Error> {
    const {experimentId, value} = args;
    const eventLogItemData = makeStringExperimentValueChangedEventLogItemData({
      experimentId,
      value,
    });
    const eventLogItem = this.makeEventLogItem(eventLogItemData);
    return this.logEvent(eventLogItem);
  }

  public async logSubscribedToFeedEvent(args: {
    readonly feedType: FeedType;
    readonly feedSubscriptionId: FeedSubscriptionId;
    readonly isNewSubscription: boolean;
  }): AsyncResult<EventLogItem, Error> {
    const {feedType, feedSubscriptionId, isNewSubscription} = args;
    const eventLogItemData = makeSubscribedToFeedEventLogItemData({
      feedType,
      feedSubscriptionId,
      isNewSubscription,
    });
    const eventLogItem = this.makeEventLogItem(eventLogItemData);
    return this.logEvent(eventLogItem);
  }

  public async logUnsubscribedFromFeedEvent(args: {
    readonly feedType: FeedType;
    readonly feedSubscriptionId: FeedSubscriptionId;
  }): AsyncResult<EventLogItem, Error> {
    const {feedType, feedSubscriptionId} = args;
    const eventLogItemData = makeUnsubscribedFromFeedEventLogItemData({
      feedType,
      feedSubscriptionId,
    });
    const eventLogItem = this.makeEventLogItem(eventLogItemData);
    return this.logEvent(eventLogItem);
  }

  public async logThemePreferenceChangedEvent(args: {
    readonly themePreference: ThemePreference;
  }): AsyncResult<EventLogItem, Error> {
    const {themePreference} = args;
    const eventLogItemData = makeThemePreferenceChangedEventLogItemData({themePreference});
    const eventLogItem = this.makeEventLogItem(eventLogItemData);
    return this.logEvent(eventLogItem);
  }
  //////////////////////////////////////
  // END INDIVIDUAL EVENT LOG HELPERS //
  //////////////////////////////////////
}
