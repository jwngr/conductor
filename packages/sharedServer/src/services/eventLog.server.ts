import type {WithFieldValue} from 'firebase-admin/firestore';

import {EVENT_LOG_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {toFirestoreTimestamp} from '@shared/lib/parser.shared';

import {parseEventId, parseEventLogItem} from '@shared/parsers/eventLog.parser';

import type {EventId, EventLogItem, EventLogItemFromSchema} from '@shared/types/eventLog.types';
import type {AsyncResult} from '@shared/types/result.types';

import {
  makeFirestoreDataConverter,
  ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';

type ServerEventLogCollectionService = ServerFirestoreCollectionService<
  EventId,
  EventLogItem,
  EventLogItemFromSchema
>;

export class ServerEventLogService {
  private readonly eventLogCollectionService: ServerEventLogCollectionService;

  constructor(args: {readonly eventLogCollectionService: ServerEventLogCollectionService}) {
    this.eventLogCollectionService = args.eventLogCollectionService;
  }

  public async fetchById(eventId: EventId): AsyncResult<EventLogItem | null> {
    return this.eventLogCollectionService.fetchById(eventId);
  }

  // public async logEvent(
  //   eventLogItem: Omit<EventLogItem, 'createdTime' | 'lastUpdatedTime'>
  // ): AsyncResult<EventId | null> {
  //   const eventId = makeEventId();
  //   const createResult = await this.eventLogCollectionService.setDoc(eventId, {
  //     eventId,
  //     actor: adminActor,
  //     eventType: EventType.FeedItemAction,
  //     data: {
  //       feedItemId: args.feedItemId,
  //       feedItemActionType: args.feedItemActionType,
  //     },
  //     createdTime: FieldValue.serverTimestamp(),
  //     lastUpdatedTime: FieldValue.serverTimestamp(),
  //   });

  //   if (!createResult.success) {
  //     logger.error(prefixError(createResult.error, 'Failed to log feed item action event'), {
  //       feedItemId: args.feedItemId,
  //       feedItemActionType: args.feedItemActionType,
  //     });
  //     return createResult;
  //   }

  //   return makeSuccessResult(eventId);
  // }

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
  toFirestoreEventLogItem,
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
export function toFirestoreEventLogItem(eventLogItem: EventLogItem): EventLogItemFromSchema {
  return {
    eventId: eventLogItem.eventId,
    userId: eventLogItem.userId,
    eventType: eventLogItem.eventType,
    data: eventLogItem.data,
    createdTime: toFirestoreTimestamp(eventLogItem.createdTime),
    lastUpdatedTime: toFirestoreTimestamp(eventLogItem.lastUpdatedTime),
  };
}
