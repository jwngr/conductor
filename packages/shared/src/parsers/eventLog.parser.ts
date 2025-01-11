import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult, toStorageTimestamp} from '@shared/lib/parser.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';

import {
  EventIdSchema,
  EventLogItemFromStorageSchema,
  EventType,
  FeedItemActionEventLogItemDataSchema,
  UserFeedSubscriptionEventLogItemDataSchema,
} from '@shared/types/eventLog.types';
import type {
  EventId,
  EventLogItem,
  EventLogItemFromStorage,
  FeedItemActionEventLogItem,
  FeedItemActionEventLogItemData,
  UserFeedSubscriptionEventLogItem,
  UserFeedSubscriptionEventLogItemData,
} from '@shared/types/eventLog.types';
import type {Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

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

  switch (parsedResult.value.eventType) {
    case EventType.FeedItemAction:
      return parseFeedItemActionEventLogItem(maybeEventLogItem);
    case EventType.UserFeedSubscription:
      return parseUserFeedSubscriptionEventLogItem(maybeEventLogItem);
    default:
      return makeErrorResult(
        new Error(`Unknown event log item type: ${parsedResult.value.eventType}`)
      );
  }
}

/**
 * Parses a {@link UserFeedSubscriptionEventLogItem} from an unknown value. Returns an `ErrorResult`
 * if the value is not valid.
 */
function parseUserFeedSubscriptionEventLogItem(
  maybeEventLogItem: unknown
): Result<UserFeedSubscriptionEventLogItem> {
  const parsedResult = parseZodResult(EventLogItemFromStorageSchema, maybeEventLogItem);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid event log item');
  }

  const parsedAccountIdResult = parseAccountId(parsedResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedEventIdResult = parseEventId(parsedResult.value.eventId);
  if (!parsedEventIdResult.success) return parsedEventIdResult;

  const parsedDataResult = parseUserFeedSubscriptionEventLogItemData(parsedResult.value.data);
  if (!parsedDataResult.success) return parsedDataResult;

  const {createdTime, lastUpdatedTime} = parsedResult.value;
  return makeSuccessResult({
    eventId: parsedEventIdResult.value,
    accountId: parsedAccountIdResult.value,
    eventType: EventType.UserFeedSubscription,
    data: parsedDataResult.value,
    createdTime: parseStorageTimestamp(createdTime),
    lastUpdatedTime: parseStorageTimestamp(lastUpdatedTime),
  });
}

/**
 * Parses a {@link FeedItemActionEventLogItem} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
function parseFeedItemActionEventLogItem(
  maybeEventLogItem: unknown
): Result<FeedItemActionEventLogItem> {
  const parsedResult = parseZodResult(EventLogItemFromStorageSchema, maybeEventLogItem);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid event log item');
  }

  const parsedAccountIdResult = parseAccountId(parsedResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedEventIdResult = parseEventId(parsedResult.value.eventId);
  if (!parsedEventIdResult.success) return parsedEventIdResult;

  const parsedDataResult = parseFeedItemActionEventLogItemData(parsedResult.value.data);
  if (!parsedDataResult.success) return parsedDataResult;

  const {createdTime, lastUpdatedTime} = parsedResult.value;
  return makeSuccessResult({
    eventId: parsedEventIdResult.value,
    accountId: parsedAccountIdResult.value,
    eventType: EventType.FeedItemAction,
    data: parsedDataResult.value,
    createdTime: parseStorageTimestamp(createdTime),
    lastUpdatedTime: parseStorageTimestamp(lastUpdatedTime),
  });
}

/**
 * Parses a {@link FeedItemActionEventLogItemData} from an unknown value. Returns an `ErrorResult`
 * if the value is not valid.
 */
function parseFeedItemActionEventLogItemData(
  maybeEventLogItemData: unknown
): Result<FeedItemActionEventLogItemData> {
  const parsedResult = parseZodResult(FeedItemActionEventLogItemDataSchema, maybeEventLogItemData);
  if (!parsedResult.success) return parsedResult;

  const parsedFeedItemIdResult = parseFeedItemId(parsedResult.value.feedItemId);
  if (!parsedFeedItemIdResult.success) return parsedFeedItemIdResult;

  return makeSuccessResult({
    feedItemId: parsedFeedItemIdResult.value,
    feedItemActionType: parsedResult.value.feedItemActionType,
  });
}

/**
 * Parses a {@link UserFeedSubscriptionEventLogItemData} from an unknown value. Returns an
 * `ErrorResult` if the value is not valid.
 */
function parseUserFeedSubscriptionEventLogItemData(
  maybeEventLogItemData: unknown
): Result<UserFeedSubscriptionEventLogItemData> {
  const parsedResult = parseZodResult(
    UserFeedSubscriptionEventLogItemDataSchema,
    maybeEventLogItemData
  );
  if (!parsedResult.success) return parsedResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  return makeSuccessResult({
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
    eventType: eventLogItem.eventType,
    data: eventLogItem.data,
    createdTime: toStorageTimestamp(eventLogItem.createdTime),
    lastUpdatedTime: toStorageTimestamp(eventLogItem.lastUpdatedTime),
  };
}
