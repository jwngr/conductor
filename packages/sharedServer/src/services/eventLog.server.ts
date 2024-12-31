import {logger} from '@shared/services/logger.shared';

import {EVENT_LOG_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';

import {
  parseEventId,
  parseEventLogItem,
  toFirestoreEventLogItem,
} from '@shared/parsers/eventLog.parser';

import type {EventId, EventLogItem, EventLogItemFromSchema} from '@shared/types/eventLog.types';
import {makeSuccessResult, type AsyncResult, type Result} from '@shared/types/result.types';

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
