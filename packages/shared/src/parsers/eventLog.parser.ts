import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {safeAssertNever} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseActor} from '@shared/parsers/actors.parser';
import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';

import {EventType} from '@shared/types/eventLog.types';
import type {
  EventId,
  EventLogItem,
  EventLogItemData,
  ExperimentDisabledEventLogItemData,
  ExperimentEnabledEventLogItemData,
  FeedItemActionEventLogItemData,
  FeedItemImportedEventLogItemData,
  StringExperimentValueChangedEventLogItemData,
  SubscribedToFeedSourceEventLogItemData,
  UnsubscribedFromFeedSourceEventLogItemData,
} from '@shared/types/eventLog.types';
import type {Result} from '@shared/types/results.types';

import {
  EventIdSchema,
  EventLogItemDataSchema,
  EventLogItemFromStorageSchema,
  ExperimentDisabledEventLogItemDataSchema,
  ExperimentEnabledEventLogItemDataSchema,
  FeedItemActionEventLogItemDataSchema,
  FeedItemImportedEventLogItemDataSchema,
  StringExperimentValueChangedEventLogItemDataSchema,
  SubscribedToFeedSourceEventLogItemDataSchema,
  UnsubscribedFromFeedSourceEventLogItemDataSchema,
} from '@shared/schemas/eventLog.schema';
import type {EventLogItemFromStorage} from '@shared/schemas/eventLog.schema';

/**
 * Parses a {@link EventId} from a plain string. Returns an `ErrorResult` if the string is not
 * valid.
 */
export function parseEventId(maybeEventId: string): Result<EventId> {
  const parsedResult = parseZodResult(EventIdSchema, maybeEventId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid event ID');
  }
  return makeSuccessResult(parsedResult.value as EventId);
}

/**
 * Parses a {@link EventLogItem} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
export function parseEventLogItem(maybeEventLogItem: unknown): Result<EventLogItem> {
  const parsedResult = parseZodResult(EventLogItemFromStorageSchema, maybeEventLogItem);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid event log item');
  }

  const parsedAccountIdResult = parseAccountId(parsedResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedActorResult = parseActor(parsedResult.value.actor);
  if (!parsedActorResult.success) return parsedActorResult;

  const parsedEventIdResult = parseEventId(parsedResult.value.eventId);
  if (!parsedEventIdResult.success) return parsedEventIdResult;

  const parsedDataResult = parseEventLogItemData(parsedResult.value.data);
  if (!parsedDataResult.success) return parsedDataResult;

  return makeSuccessResult({
    eventId: parsedEventIdResult.value,
    accountId: parsedAccountIdResult.value,
    actor: parsedActorResult.value,
    environment: parsedResult.value.environment,
    data: parsedDataResult.value,
    createdTime: parseStorageTimestamp(parsedResult.value.createdTime),
    lastUpdatedTime: parseStorageTimestamp(parsedResult.value.lastUpdatedTime),
  } as EventLogItem);
}

function parseEventLogItemData(maybeEventLogItemData: unknown): Result<EventLogItemData> {
  const parsedLogItemDataResult = parseZodResult(EventLogItemDataSchema, maybeEventLogItemData);
  if (!parsedLogItemDataResult.success) {
    return prefixErrorResult(parsedLogItemDataResult, 'Invalid event log item data');
  }
  const parsedLogItemData = parsedLogItemDataResult.value;

  switch (parsedLogItemData.eventType) {
    case EventType.FeedItemAction:
      return parseFeedItemActionEventLogItemData(parsedLogItemData);
    case EventType.FeedItemImported:
      return parseFeedItemImportedEventLogItemData(parsedLogItemData);
    case EventType.ExperimentEnabled:
      return parseExperimentEnabledEventLogItemData(parsedLogItemData);
    case EventType.ExperimentDisabled:
      return parseExperimentDisabledEventLogItemData(parsedLogItemData);
    case EventType.StringExperimentValueChanged:
      return parseStringExperimentValueChangedEventLogItemData(parsedLogItemData);
    case EventType.SubscribedToFeedSource:
      return parseSubscribedToFeedSourceEventLogItemData(parsedLogItemData);
    case EventType.UnsubscribedFromFeedSource:
      return parseUnsubscribedFromFeedSourceEventLogItemData(parsedLogItemData);
    default:
      safeAssertNever(parsedLogItemData);
      return makeErrorResult(new Error('Unknown event log item type'));
  }
}

function parseFeedItemActionEventLogItemData(
  maybeEventLogItemData: unknown
): Result<FeedItemActionEventLogItemData> {
  const parsedResult = parseZodResult(FeedItemActionEventLogItemDataSchema, maybeEventLogItemData);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid event log item data');
  }

  const parsedFeedItemIdResult = parseFeedItemId(parsedResult.value.feedItemId);
  if (!parsedFeedItemIdResult.success) return parsedFeedItemIdResult;

  return makeSuccessResult({
    eventType: EventType.FeedItemAction,
    feedItemId: parsedFeedItemIdResult.value,
    feedItemActionType: parsedResult.value.feedItemActionType,
  });
}

function parseFeedItemImportedEventLogItemData(
  maybeEventLogItemData: unknown
): Result<FeedItemImportedEventLogItemData> {
  const parsedResult = parseZodResult(
    FeedItemImportedEventLogItemDataSchema,
    maybeEventLogItemData
  );
  if (!parsedResult.success) return parsedResult;

  const parsedFeedItemIdResult = parseFeedItemId(parsedResult.value.feedItemId);
  if (!parsedFeedItemIdResult.success) return parsedFeedItemIdResult;

  return makeSuccessResult({
    eventType: EventType.FeedItemImported,
    feedItemId: parsedFeedItemIdResult.value,
  });
}

function parseExperimentEnabledEventLogItemData(
  maybeEventLogItemData: unknown
): Result<ExperimentEnabledEventLogItemData> {
  const parsedResult = parseZodResult(
    ExperimentEnabledEventLogItemDataSchema,
    maybeEventLogItemData
  );
  if (!parsedResult.success) return parsedResult;

  return makeSuccessResult({
    eventType: EventType.ExperimentEnabled,
    experimentId: parsedResult.value.experimentId,
    experimentType: parsedResult.value.experimentType,
  });
}

function parseExperimentDisabledEventLogItemData(
  maybeEventLogItemData: unknown
): Result<ExperimentDisabledEventLogItemData> {
  const parsedResult = parseZodResult(
    ExperimentDisabledEventLogItemDataSchema,
    maybeEventLogItemData
  );
  if (!parsedResult.success) return parsedResult;

  return makeSuccessResult({
    eventType: EventType.ExperimentDisabled,
    experimentId: parsedResult.value.experimentId,
    experimentType: parsedResult.value.experimentType,
  });
}

function parseStringExperimentValueChangedEventLogItemData(
  maybeEventLogItemData: unknown
): Result<StringExperimentValueChangedEventLogItemData> {
  const parsedResult = parseZodResult(
    StringExperimentValueChangedEventLogItemDataSchema,
    maybeEventLogItemData
  );
  if (!parsedResult.success) return parsedResult;

  return makeSuccessResult({
    eventType: EventType.StringExperimentValueChanged,
    experimentId: parsedResult.value.experimentId,
    value: parsedResult.value.value,
  });
}

function parseSubscribedToFeedSourceEventLogItemData(
  maybeEventLogItemData: unknown
): Result<SubscribedToFeedSourceEventLogItemData> {
  const parsedResult = parseZodResult(
    SubscribedToFeedSourceEventLogItemDataSchema,
    maybeEventLogItemData
  );
  if (!parsedResult.success) return parsedResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  return makeSuccessResult({
    eventType: EventType.SubscribedToFeedSource,
    feedSourceType: parsedResult.value.feedSourceType,
    userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
  });
}

function parseUnsubscribedFromFeedSourceEventLogItemData(
  maybeEventLogItemData: unknown
): Result<UnsubscribedFromFeedSourceEventLogItemData> {
  const parsedResult = parseZodResult(
    UnsubscribedFromFeedSourceEventLogItemDataSchema,
    maybeEventLogItemData
  );
  if (!parsedResult.success) return parsedResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  return makeSuccessResult({
    eventType: EventType.UnsubscribedFromFeedSource,
    feedSourceType: parsedResult.value.feedSourceType,
    userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
  });
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
