import {z} from 'zod';

import {makeUuid} from '@shared/lib/utils.shared';

import {FeedItemActionType, FeedItemIdSchema} from '@shared/types/feedItems.types';
import type {FeedItemId} from '@shared/types/feedItems.types';
import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {UserId} from '@shared/types/user.types';
import {UserIdSchema} from '@shared/types/user.types';
import {UserFeedSubscriptionIdSchema} from '@shared/types/userFeedSubscriptions.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Strongly-typed type for an event's unique identifier. Prefer this over plain strings.
 */
export type EventId = string & {readonly __brand: 'EventIdBrand'};

/**
 * Zod schema for an {@link EventId}.
 */
// TODO: Consider adding `brand()` and defining `EventId` based on this schema.
export const EventIdSchema = z.string().uuid();

/**
 * Creates a new random {@link EventId}.
 */
export function makeEventId(): EventId {
  return makeUuid<EventId>();
}

export enum EventType {
  FeedItemAction = 'FEED_ITEM_ACTION',
  UserFeedSubscription = 'USER_FEED_SUBSCRIPTION',
}

export interface FeedItemActionEventLogItemData extends Record<string, unknown> {
  readonly feedItemId: FeedItemId;
  readonly feedItemActionType: FeedItemActionType;
}

export const FeedItemActionEventLogItemDataSchema = z.object({
  feedItemId: FeedItemIdSchema,
  feedItemActionType: z.nativeEnum(FeedItemActionType),
});

export interface UserFeedSubscriptionEventLogItemData extends Record<string, unknown> {
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  // TODO: Add `userFeedSubscriptionActionType`.
}

export const UserFeedSubscriptionEventLogItemDataSchema = z.object({
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

const EventLogItemDataSchema = FeedItemActionEventLogItemDataSchema.or(
  UserFeedSubscriptionEventLogItemDataSchema
);

/**
 * Base interface for all event log items. Most things that happen in the app are logged and tracked
 * as an event.
 */
interface BaseEventLogItem extends BaseStoreItem {
  readonly eventType: EventType;
  readonly eventId: EventId;
  // TODO: Replace this with an `actor` field so that admin logs can be integrated as well.
  readonly userId: UserId;
  /** Arbitrary data associated with the event. */
  readonly data?: Record<string, unknown>;
}

/**
 * Zod schema for an {@link EventLogItem}.
 */
export const EventLogItemSchema = z.object({
  eventId: EventIdSchema,
  userId: UserIdSchema,
  eventType: z.nativeEnum(EventType),
  data: EventLogItemDataSchema,
  createdTime: FirestoreTimestampSchema,
  lastUpdatedTime: FirestoreTimestampSchema,
});

export type EventLogItemFromSchema = z.infer<typeof EventLogItemSchema>;
export interface FeedItemActionEventLogItem extends BaseEventLogItem {
  readonly eventType: EventType.FeedItemAction;
  readonly data: FeedItemActionEventLogItemData;
}

export interface UserFeedSubscriptionEventLogItem extends BaseEventLogItem {
  readonly eventType: EventType.UserFeedSubscription;
  readonly data: UserFeedSubscriptionEventLogItemData;
}

export type EventLogItem = FeedItemActionEventLogItem | UserFeedSubscriptionEventLogItem;
