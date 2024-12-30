import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

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
    createdTime: createdTime.toDate(),
    lastUpdatedTime: lastUpdatedTime.toDate(),
  });
}

/**
 * Parses a {@link FeedItemActionEventLogItem} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
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
    createdTime: createdTime.toDate(),
    lastUpdatedTime: lastUpdatedTime.toDate(),
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

export const eventLogItemFirestoreConverter: FirestoreDataConverter<EventLogItem> = {
  toFirestore(eventLogItem: EventLogItem): DocumentData {
    return {
      eventId: eventLogItem.eventId,
      userId: eventLogItem.userId,
      eventType: eventLogItem.eventType,
      data: eventLogItem.data,
      createdTime: eventLogItem.createdTime,
      lastUpdatedTime: eventLogItem.lastUpdatedTime,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): EventLogItem {
    const data = snapshot.data(options);
    if (!data) throw new Error('Event log item document data is null');
    const parseResult = parseEventLogItem(data);
    if (!parseResult.success) throw parseResult.error;
    return parseResult.value;
  },
};
