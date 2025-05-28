import type {WithFieldValue} from 'firebase-admin/firestore';

import {logger} from '@shared/services/logger.shared';

import {SYSTEM_ACTOR} from '@shared/lib/actors.shared';
import {EVENT_LOG_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeEventId} from '@shared/lib/eventLog.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {parseEventId, parseEventLogItem} from '@shared/parsers/eventLog.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {Environment} from '@shared/types/environment.types';
import {EventType} from '@shared/types/eventLog.types';
import type {EventId, EventLogItem} from '@shared/types/eventLog.types';
import type {FeedItemId} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {EventLogItemFromStorage} from '@shared/schemas/eventLog.schema';

import {
  makeFirestoreDataConverter,
  ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';

type ServerEventLogCollectionService = ServerFirestoreCollectionService<
  EventId,
  EventLogItem,
  EventLogItemFromStorage
>;

class ServerEventLogService {
  private readonly eventLogCollectionService: ServerEventLogCollectionService;

  constructor(args: {readonly eventLogCollectionService: ServerEventLogCollectionService}) {
    this.eventLogCollectionService = args.eventLogCollectionService;
  }

  public async fetchById(eventId: EventId): AsyncResult<EventLogItem | null> {
    return this.eventLogCollectionService.fetchById(eventId);
  }

  public async logFeedItemImportedEvent(args: {
    readonly feedItemId: FeedItemId;
    readonly accountId: AccountId;
  }): AsyncResult<EventId | null> {
    const eventId = makeEventId();
    const createResult = await this.eventLogCollectionService.setDoc(eventId, {
      eventId,
      accountId: args.accountId,
      actor: SYSTEM_ACTOR,
      environment: Environment.Server,
      eventType: EventType.FeedItemImported,
      data: {
        feedItemId: args.feedItemId,
      },
      // TODO(timestamps): Use server timestamps instead.
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    });

    if (!createResult.success) {
      logger.error(prefixError(createResult.error, 'Failed to log feed item imported event'), {
        feedItemId: args.feedItemId,
      });
      return createResult;
    }

    return makeSuccessResult(eventId);
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

// Initialize a singleton instance of the event log service
const eventLogItemFirestoreConverter = makeFirestoreDataConverter(
  toStorageEventLogItem,
  parseEventLogItem
);

const eventLogCollectionService = new ServerFirestoreCollectionService({
  collectionPath: EVENT_LOG_DB_COLLECTION,
  converter: eventLogItemFirestoreConverter,
  parseId: parseEventId,
});

export const eventLogService = new ServerEventLogService({
  eventLogCollectionService,
});

/**
 * Converts a {@link EventLogItem} to a {@link EventLogItemFromStorage} object that can be persisted
 * to Firestore.
 */
export function toStorageEventLogItem(eventLogItem: EventLogItem): EventLogItemFromStorage {
  return {
    eventId: eventLogItem.eventId,
    eventType: eventLogItem.eventType,
    accountId: eventLogItem.accountId,
    actor: eventLogItem.actor,
    environment: eventLogItem.environment,
    data: eventLogItem.data,
    createdTime: eventLogItem.createdTime,
    lastUpdatedTime: eventLogItem.lastUpdatedTime,
  };
}
