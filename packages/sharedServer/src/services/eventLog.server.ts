import type {WithFieldValue} from 'firebase-admin/firestore';

import {logger} from '@shared/services/logger.shared';

import {SYSTEM_ACTOR} from '@shared/lib/actors.shared';
import {prefixError, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeEventLogItem, makeFeedItemImportedEventLogItemData} from '@shared/lib/eventLog.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {ServerEnvironment} from '@shared/types/environment.types';
import type {EventId, EventLogItem, EventLogItemData} from '@shared/types/eventLog.types';
import type {FeedItemId} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {EventLogItemFromStorage} from '@shared/schemas/eventLog.schema';

import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

type ServerEventLogCollectionService = ServerFirestoreCollectionService<
  EventId,
  EventLogItem,
  EventLogItemFromStorage
>;

export class ServerEventLogService {
  private readonly environment: ServerEnvironment;
  private readonly eventLogCollectionService: ServerEventLogCollectionService;

  constructor(args: {
    readonly environment: ServerEnvironment;
    readonly eventLogCollectionService: ServerEventLogCollectionService;
  }) {
    this.environment = args.environment;
    this.eventLogCollectionService = args.eventLogCollectionService;
  }

  public async fetchById(eventId: EventId): AsyncResult<EventLogItem | null> {
    return this.eventLogCollectionService.fetchById(eventId);
  }

  public async logEvent(eventLogItem: EventLogItem): AsyncResult<EventLogItem> {
    const {eventId} = eventLogItem;

    const createResult = await this.eventLogCollectionService.setDoc(eventId, eventLogItem);

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

  public async logFeedItemImportedEvent(args: {
    readonly accountId: AccountId;
    readonly feedItemId: FeedItemId;
  }): AsyncResult<EventLogItem> {
    const {accountId, feedItemId} = args;
    const eventLogItemData = makeFeedItemImportedEventLogItemData({feedItemId});
    const eventLogItem = this.makeEventLogItem({accountId, data: eventLogItemData});
    return this.logEvent(eventLogItem);
  }

  public async updateEventLogItem(
    eventId: EventId,
    item: Partial<WithFieldValue<Pick<EventLogItem, 'data'>>>
  ): AsyncResult<void> {
    const updateResult = await this.eventLogCollectionService.updateDoc(eventId, item);
    return prefixResultIfError(updateResult, 'Error updating event log item');
  }

  public async deleteEventLogItem(eventId: EventId): AsyncResult<void> {
    const deleteResult = await this.eventLogCollectionService.deleteDoc(eventId);
    return prefixResultIfError(deleteResult, 'Error deleting event log item');
  }
}

/**
 * Converts a {@link EventLogItem} to a {@link EventLogItemFromStorage} object that can be persisted
 * to Firestore.
 */
export function toStorageEventLogItem(eventLogItem: EventLogItem): EventLogItemFromStorage {
  return {
    eventId: eventLogItem.eventId,
    accountId: eventLogItem.accountId,
    actor: eventLogItem.actor,
    environment: eventLogItem.environment,
    data: eventLogItem.data,
    createdTime: eventLogItem.createdTime,
    lastUpdatedTime: eventLogItem.lastUpdatedTime,
  };
}
