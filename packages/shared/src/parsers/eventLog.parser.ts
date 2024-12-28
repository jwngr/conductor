import {parseZodResult, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseUserId} from '@shared/parsers/user.parser';
import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';

import {
  EventIdSchema,
  EventLogItemSchema,
  EventType,
  FeedItemActionEventLogItemDataSchema,
  UserFeedSubscriptionEventLogItemDataSchema,
} from '@shared/types/eventLog.types';
import type {
  EventId,
  EventLogItem,
  FeedItemActionEventLogItem,
  FeedItemActionEventLogItemData,
  UserFeedSubscriptionEventLogItem,
  UserFeedSubscriptionEventLogItemData,
} from '@shared/types/eventLog.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {Timestamp} from '@shared/types/utils.types';

/**
 * Converts a plain string into a strongly-typed `EventId`. Returns an error if the string is
 * not a valid `EventId`.
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

  switch (parsedResult.value.eventType) {
    case EventType.FeedItemAction:
      return parseFeedItemActionEventLogItem(maybeEventLogItem);
    case EventType.UserFeedSubscription:
      return parseUserFeedSubscriptionEventLogItem(maybeEventLogItem);
    default:
      assertNever(parsedResult.value.eventType);
  }
}

function parseUserFeedSubscriptionEventLogItem(
  maybeEventLogItem: unknown
): Result<UserFeedSubscriptionEventLogItem> {
  const parsedResult = parseZodResult(EventLogItemSchema, maybeEventLogItem);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid event log item');
  }

  const parsedUserIdResult = parseUserId(parsedResult.value.userId);
  if (!parsedUserIdResult.success) return parsedUserIdResult;

  const parsedEventIdResult = parseEventId(parsedResult.value.eventId);
  if (!parsedEventIdResult.success) return parsedEventIdResult;

  const parsedDataResult = parseUserFeedSubscriptionEventLogItemData(parsedResult.value.data);
  if (!parsedDataResult.success) return parsedDataResult;

  const {createdTime, lastUpdatedTime} = parsedResult.value;
  return makeSuccessResult({
    eventId: parsedEventIdResult.value,
    userId: parsedUserIdResult.value,
    eventType: EventType.UserFeedSubscription,
    data: parsedDataResult.value,
    createdTime: new Date(createdTime) as unknown as Timestamp,
    lastUpdatedTime: new Date(lastUpdatedTime) as unknown as Timestamp,
  });
}

function parseFeedItemActionEventLogItem(
  maybeEventLogItem: unknown
): Result<FeedItemActionEventLogItem> {
  const parsedResult = parseZodResult(EventLogItemSchema, maybeEventLogItem);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid event log item');
  }

  const parsedUserIdResult = parseUserId(parsedResult.value.userId);
  if (!parsedUserIdResult.success) return parsedUserIdResult;

  const parsedEventIdResult = parseEventId(parsedResult.value.eventId);
  if (!parsedEventIdResult.success) return parsedEventIdResult;

  const parsedDataResult = parseFeedItemActionEventLogItemData(parsedResult.value.data);
  if (!parsedDataResult.success) return parsedDataResult;

  const {createdTime, lastUpdatedTime} = parsedResult.value;
  return makeSuccessResult({
    eventId: parsedEventIdResult.value,
    userId: parsedUserIdResult.value,
    eventType: EventType.FeedItemAction,
    data: parsedDataResult.value,
    createdTime: new Date(createdTime) as unknown as Timestamp,
    lastUpdatedTime: new Date(lastUpdatedTime) as unknown as Timestamp,
  });
}

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
