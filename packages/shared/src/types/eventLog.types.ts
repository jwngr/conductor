import {z} from 'zod';

import {parseZodResult, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {assertNever, makeId} from '@shared/lib/utils.shared';

import {
  FeedItemActionType,
  FeedItemIdSchema,
  parseFeedItemId,
  type FeedItemId,
} from '@shared/types/feedItems.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import {parseUserId, UserIdSchema} from '@shared/types/user.types';
import {
  parseUserFeedSubscriptionId,
  UserFeedSubscriptionIdSchema,
  type UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import type {BaseStoreItem, Timestamp} from '@shared/types/utils.types';

/**
 * Strongly-typed type for an event's unique identifier. Prefer this over plain strings.
 */
export type EventId = string & {readonly __brand: 'EventIdBrand'};

export const EventIdSchema = z.string().uuid();

/**
 * Converts a plain string into a strongly-typed `EventId`. Returns an error if the string is
 * not a valid `EventId`.
 */
export function parseEventId(maybeEventId: string = makeId()): Result<EventId> {
  const parsedResult = parseZodResult(EventIdSchema, maybeEventId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid event ID');
  }
  return makeSuccessResult(parsedResult.value as EventId);
}

/**
 * Creates a new random {@link EventId}.
 */
export function makeEventId(): EventId {
  return makeId() as EventId;
}

export enum EventType {
  FeedItemAction = 'FEED_ITEM_ACTION',
  UserFeedSubscription = 'USER_FEED_SUBSCRIPTION',
}

const UserFeedSubscriptionEventLogItemDataSchema = z.object({
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

const FeedItemActionEventLogItemDataSchema = z.object({
  feedItemId: FeedItemIdSchema,
  feedItemActionType: z.nativeEnum(FeedItemActionType),
});

interface FeedItemActionEventLogItemData extends Record<string, unknown> {
  readonly feedItemId: FeedItemId;
  readonly feedItemActionType: FeedItemActionType;
}

interface UserFeedSubscriptionEventLogItemData extends Record<string, unknown> {
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  // TODO: Add `userFeedSubscriptionActionType`.
}

const EventLogItemDataSchema = FeedItemActionEventLogItemDataSchema.or(
  UserFeedSubscriptionEventLogItemDataSchema
);

export const EventLogItemSchema = z.object({
  eventId: EventIdSchema,
  userId: UserIdSchema,
  eventType: z.nativeEnum(EventType),
  data: EventLogItemDataSchema,
  // createdTime: z.string().datetime(),
  // lastUpdatedTime: z.string().datetime(),
  createdTime: z.date(),
  lastUpdatedTime: z.date(),
});

// type GeneratedEventLogItemSchema = z.infer<typeof EventLogItemSchema>;

// interface BaseEventLogItem
//   extends Omit<GeneratedEventLogItemSchema, 'createdTime' | 'lastUpdatedTime'>,
//     BaseStoreItem {
//   //
// }

interface BaseEventLogItem extends BaseStoreItem {
  readonly eventType: EventType;
  readonly eventId: EventId;
  readonly userId: UserId;
  /** Arbitrary data associated with the event. */
  readonly data?: Record<string, unknown>;
}

export interface FeedItemActionEventLogItem extends BaseEventLogItem {
  readonly eventType: EventType.FeedItemAction;
  readonly data: FeedItemActionEventLogItemData;
}

export interface UserFeedSubscriptionEventLogItem extends BaseEventLogItem {
  readonly eventType: EventType.UserFeedSubscription;
  readonly data: UserFeedSubscriptionEventLogItemData;
}

export type EventLogItem = FeedItemActionEventLogItem | UserFeedSubscriptionEventLogItem;

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
