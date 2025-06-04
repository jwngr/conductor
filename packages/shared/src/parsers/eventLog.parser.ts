import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {EventId, EventLogItem} from '@shared/types/eventLog.types';
import type {Result} from '@shared/types/results.types';

import type {EventLogItemFromStorage} from '@shared/schemas/eventLog.schema';
import {EventIdSchema, EventLogItemSchema} from '@shared/schemas/eventLog.schema';
import {fromStorageEventLogItem} from '@shared/storage/eventLog.storage';

/**
 * Attempts to parse an {@link EventId} from a plain string.
 */
export function parseEventId(maybeEventId: string): Result<EventId> {
  const parsedResult = parseZodResult(EventIdSchema, maybeEventId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid event ID');
  }
  return makeSuccessResult(parsedResult.value as EventId);
}

/**
 * Attempts to parse an unknown value into an {@link EventLogItem}.
 */
export function parseEventLogItem(
  maybeEventLogItem: EventLogItemFromStorage
): Result<EventLogItem> {
  const parsedResult = parseZodResult(EventLogItemSchema, maybeEventLogItem);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid event log item');
  }

  const eventLogItemFromStorage = parsedResult.value;
  return fromStorageEventLogItem(eventLogItemFromStorage);
}
