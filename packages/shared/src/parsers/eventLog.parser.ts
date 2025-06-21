import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {EventLogItem, EventLogItemId} from '@shared/types/eventLog.types';
import type {Result} from '@shared/types/results.types';

import {EventIdSchema, EventLogItemSchema} from '@shared/schemas/eventLog.schema';
import {fromStorageEventLogItem} from '@shared/storage/eventLog.storage';

/**
 * Attempts to parse a plain string into an {@link EventLogItemId}.
 */
export function parseEventId(maybeEventId: string): Result<EventLogItemId, Error> {
  const parsedResult = parseZodResult(EventIdSchema, maybeEventId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid event ID');
  }
  return makeSuccessResult(parsedResult.value as EventLogItemId);
}

/**
 * Attempts to parse an unknown value into an {@link EventLogItem}.
 */
export function parseEventLogItem(maybeEventLogItem: unknown): Result<EventLogItem, Error> {
  const parsedResult = parseZodResult(EventLogItemSchema, maybeEventLogItem);
  if (!parsedResult.success) return prefixErrorResult(parsedResult, 'Invalid event log item');

  const eventLogItemFromStorage = parsedResult.value;
  return fromStorageEventLogItem(eventLogItemFromStorage);
}
