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
  ThemePreferenceChangedEventLogItemData,
  UnsubscribedFromFeedSourceEventLogItemData,
} from '@shared/types/eventLog.types';
import type {Result} from '@shared/types/results.types';

import type {
  EventLogItemFromStorage,
  ExperimentDisabledEventLogItemDataFromStorage,
  ExperimentEnabledEventLogItemDataFromStorage,
  FeedItemActionEventLogItemDataFromStorage,
  FeedItemImportedEventLogItemDataFromStorage,
  StringExperimentValueChangedEventLogItemDataFromStorage,
  SubscribedToFeedSourceEventLogItemDataFromStorage,
  ThemePreferenceChangedEventLogItemDataFromStorage,
  UnsubscribedFromFeedSourceEventLogItemDataFromStorage,
} from '@shared/schemas/eventLog.schema';
import {
  EventIdSchema,
  EventLogItemDataSchema,
  EventLogItemSchema,
} from '@shared/schemas/eventLog.schema';

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
  const parsedResult = parseZodResult(EventLogItemSchema, maybeEventLogItem);
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
    case EventType.ThemePreferenceChanged:
      return parseThemePreferenceChangedEventLogItemData(parsedLogItemData);
    default: {
      safeAssertNever(parsedLogItemData);
      return makeErrorResult(new Error('Unknown event log item type'));
    }
  }
}

function parseFeedItemActionEventLogItemData(
  eventLogItemData: FeedItemActionEventLogItemDataFromStorage
): Result<FeedItemActionEventLogItemData> {
  const parsedFeedItemIdResult = parseFeedItemId(eventLogItemData.feedItemId);
  if (!parsedFeedItemIdResult.success) return parsedFeedItemIdResult;

  return makeSuccessResult({
    eventType: EventType.FeedItemAction,
    feedItemId: parsedFeedItemIdResult.value,
    feedItemActionType: eventLogItemData.feedItemActionType,
  });
}

function parseFeedItemImportedEventLogItemData(
  eventLogItemData: FeedItemImportedEventLogItemDataFromStorage
): Result<FeedItemImportedEventLogItemData> {
  const parsedFeedItemIdResult = parseFeedItemId(eventLogItemData.feedItemId);
  if (!parsedFeedItemIdResult.success) return parsedFeedItemIdResult;

  return makeSuccessResult({
    eventType: EventType.FeedItemImported,
    feedItemId: parsedFeedItemIdResult.value,
  });
}

function parseExperimentEnabledEventLogItemData(
  eventLogItemData: ExperimentEnabledEventLogItemDataFromStorage
): Result<ExperimentEnabledEventLogItemData> {
  return makeSuccessResult({
    eventType: EventType.ExperimentEnabled,
    experimentId: eventLogItemData.experimentId,
    experimentType: eventLogItemData.experimentType,
  });
}

function parseExperimentDisabledEventLogItemData(
  eventLogItemData: ExperimentDisabledEventLogItemDataFromStorage
): Result<ExperimentDisabledEventLogItemData> {
  return makeSuccessResult({
    eventType: EventType.ExperimentDisabled,
    experimentId: eventLogItemData.experimentId,
    experimentType: eventLogItemData.experimentType,
  });
}

function parseStringExperimentValueChangedEventLogItemData(
  eventLogItemData: StringExperimentValueChangedEventLogItemDataFromStorage
): Result<StringExperimentValueChangedEventLogItemData> {
  return makeSuccessResult({
    eventType: EventType.StringExperimentValueChanged,
    experimentId: eventLogItemData.experimentId,
    value: eventLogItemData.value,
  });
}

function parseSubscribedToFeedSourceEventLogItemData(
  eventLogItemData: SubscribedToFeedSourceEventLogItemDataFromStorage
): Result<SubscribedToFeedSourceEventLogItemData> {
  const parsedSubIdResult = parseUserFeedSubscriptionId(eventLogItemData.userFeedSubscriptionId);
  if (!parsedSubIdResult.success) return parsedSubIdResult;

  return makeSuccessResult({
    eventType: EventType.SubscribedToFeedSource,
    feedSourceType: eventLogItemData.feedSourceType,
    userFeedSubscriptionId: parsedSubIdResult.value,
    isResubscribe: eventLogItemData.isResubscribe,
  });
}

function parseUnsubscribedFromFeedSourceEventLogItemData(
  eventLogItemData: UnsubscribedFromFeedSourceEventLogItemDataFromStorage
): Result<UnsubscribedFromFeedSourceEventLogItemData> {
  const parsedSubIdResult = parseUserFeedSubscriptionId(eventLogItemData.userFeedSubscriptionId);
  if (!parsedSubIdResult.success) return parsedSubIdResult;

  return makeSuccessResult({
    eventType: EventType.UnsubscribedFromFeedSource,
    feedSourceType: eventLogItemData.feedSourceType,
    userFeedSubscriptionId: parsedSubIdResult.value,
  });
}

function parseThemePreferenceChangedEventLogItemData(
  eventLogItemData: ThemePreferenceChangedEventLogItemDataFromStorage
): Result<ThemePreferenceChangedEventLogItemData> {
  return makeSuccessResult({
    eventType: EventType.ThemePreferenceChanged,
    themePreference: eventLogItemData.themePreference,
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
