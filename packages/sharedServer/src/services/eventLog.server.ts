import type {WithFieldValue} from 'firebase-admin/firestore';

import {logger} from '@shared/services/logger.shared';

import {SYSTEM_ACTOR} from '@shared/lib/actors.shared';
import {EVENT_LOG_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeEventLogItem, makeFeedItemImportedEventLogItemData} from '@shared/lib/eventLog.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {parseEventId, parseEventLogItem} from '@shared/parsers/eventLog.parser';

import type {ServerEnvironment} from '@shared/types/environment.types';
import type {EventLogItem, EventLogItemData, EventLogItemId} from '@shared/types/eventLog.types';
import type {AccountId, FeedItemId} from '@shared/types/ids.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {EventLogItemFromStorage} from '@shared/schemas/eventLog.schema';
import {toStorageEventLogItem} from '@shared/storage/eventLog.storage';

import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';
import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';
import {makeServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

type ServerEventLogCollectionService = ServerFirestoreCollectionService<
  EventLogItemId,
  EventLogItem,
  EventLogItemFromStorage
>;

export class ServerEventLogService {
  private readonly environment: ServerEnvironment;
  private readonly collectionService: ServerEventLogCollectionService;

  constructor(args: {
    readonly environment: ServerEnvironment;
    readonly firebaseService: ServerFirebaseService;
  }) {
    this.environment = args.environment;
    this.collectionService = makeServerFirestoreCollectionService({
      firebaseService: args.firebaseService,
      collectionPath: EVENT_LOG_DB_COLLECTION,
      toStorage: toStorageEventLogItem,
      fromStorage: parseEventLogItem,
      parseId: parseEventId,
    });
  }

  public async fetchById(eventId: EventLogItemId): AsyncResult<EventLogItem | null, Error> {
    return this.collectionService.fetchById(eventId);
  }

  private async logEvent(eventLogItem: EventLogItem): AsyncResult<EventLogItem, Error> {
    const {eventId} = eventLogItem;

    const createResult = await this.collectionService.setDoc(eventId, eventLogItem);

    if (!createResult.success) {
      logger.error(prefixError(createResult.error, 'Failed to log event'), {eventLogItem});
      return createResult;
    }

    return makeSuccessResult(eventLogItem);
  }

  private makeEventLogItem(args: {
    readonly accountId: AccountId;
    readonly data: EventLogItemData;
  }): EventLogItem {
    const {accountId, data} = args;
    return makeEventLogItem({
      accountId,
      actor: SYSTEM_ACTOR,
      environment: this.environment,
      data,
    });
  }

  public async updateEventLogItem(
    eventId: EventLogItemId,
    item: Partial<WithFieldValue<Pick<EventLogItem, 'data'>>>
  ): AsyncResult<void, Error> {
    const updateResult = await this.collectionService.updateDoc(eventId, item);
    return prefixResultIfError(updateResult, 'Error updating event log item');
  }

  public async deleteEventLogItem(eventId: EventLogItemId): AsyncResult<void, Error> {
    const deleteResult = await this.collectionService.deleteDoc(eventId);
    return prefixResultIfError(deleteResult, 'Error deleting event log item');
  }

  //////////////////////////////////////////
  //  BEGIN INDIVIDUAL EVENT LOG HELPERS  //
  //////////////////////////////////////////
  public async logFeedItemImportedEvent(args: {
    readonly accountId: AccountId;
    readonly feedItemId: FeedItemId;
  }): AsyncResult<EventLogItem, Error> {
    const {accountId, feedItemId} = args;
    const eventLogItemData = makeFeedItemImportedEventLogItemData({feedItemId});
    const eventLogItem = this.makeEventLogItem({accountId, data: eventLogItemData});
    return this.logEvent(eventLogItem);
  }
  ////////////////////////////////////////
  //  END INDIVIDUAL EVENT LOG HELPERS  //
  ////////////////////////////////////////
}
