import {z} from 'zod';

import type {AccountId} from '@shared/types/accounts.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import {DeliveryScheduleFromStorageSchema} from '@shared/types/deliverySchedules.types';
import type {PersistedFeedSourceType} from '@shared/types/feedSourceTypes.types';
import {FeedSourceType, PERSISTED_FEED_SOURCE_TYPES} from '@shared/types/feedSourceTypes.types';
import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {BaseStoreItem} from '@shared/types/utils.types';
import {YouTubeChannelIdSchema, type YouTubeChannelId} from '@shared/types/youtube.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';

/**
 * Strongly-typed type for a {@link UserFeedSubscription}'s unique identifier. Prefer this over
 * plain strings.
 */
export type UserFeedSubscriptionId = string & {readonly __brand: 'UserFeedSubscriptionIdBrand'};

/**
 * Zod schema for a {@link UserFeedSubscriptionId}.
 */
export const UserFeedSubscriptionIdSchema = z.string().uuid();

/**
 * An individual account's subscription to a feed source.
 *
 * A single URL can have multiple {@link UserFeedSubscription}s, one for each {@link Account}
 * subscribed to it.
 *
 * User feed subscriptions are not deleted when an account unsubscribes from a feed. Instead, they
 * are marked as inactive. They are only deleted when an account is wiped out.
 */
interface BaseUserFeedSubscription extends BaseStoreItem {
  /** The type of feed source this subscription is for. */
  readonly feedSourceType: PersistedFeedSourceType;
  /** The unique identifier for this subscription. */
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  /** The account that owns this subscription. */
  readonly accountId: AccountId;
  /** Whether this subscription is active. Inactive subscriptions do not generate new feed items. */
  readonly isActive: boolean;
  /** The delivery schedule for this subscription. */
  readonly deliverySchedule: DeliverySchedule;
  /** The time this subscription was unsubscribed from the feed source. */
  readonly unsubscribedTime?: Date | undefined;
}

export interface RssUserFeedSubscription extends BaseUserFeedSubscription {
  readonly feedSourceType: FeedSourceType.RSS;
  readonly url: string;
  readonly title: string;
}

export interface YouTubeChannelUserFeedSubscription extends BaseUserFeedSubscription {
  readonly feedSourceType: FeedSourceType.YouTubeChannel;
  readonly channelId: YouTubeChannelId;
}

export interface IntervalUserFeedSubscription extends BaseUserFeedSubscription {
  readonly feedSourceType: FeedSourceType.Interval;
  readonly intervalSeconds: number;
}

export type UserFeedSubscription =
  | RssUserFeedSubscription
  | YouTubeChannelUserFeedSubscription
  | IntervalUserFeedSubscription;

/**
 * Zod schema for a {@link UserFeedSubscription} persisted to Firestore.
 */
const BaseUserFeedSubscriptionFromStorageSchema = z.object({
  feedSourceType: z.enum(PERSISTED_FEED_SOURCE_TYPES),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  accountId: AccountIdSchema,
  isActive: z.boolean(),
  deliverySchedule: DeliveryScheduleFromStorageSchema,
  unsubscribedTime: FirestoreTimestampSchema.or(z.date()).optional(),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

export const RssUserFeedSubscriptionFromStorageSchema =
  BaseUserFeedSubscriptionFromStorageSchema.extend({
    feedSourceType: z.literal(FeedSourceType.RSS),
    url: z.string().url(),
    title: z.string(),
  });

export const YouTubeChannelUserFeedSubscriptionFromStorageSchema =
  BaseUserFeedSubscriptionFromStorageSchema.extend({
    feedSourceType: z.literal(FeedSourceType.YouTubeChannel),
    channelId: YouTubeChannelIdSchema,
  });

export const IntervalUserFeedSubscriptionFromStorageSchema =
  BaseUserFeedSubscriptionFromStorageSchema.extend({
    feedSourceType: z.literal(FeedSourceType.Interval),
    intervalSeconds: z.number().positive().int().min(60),
  });

export const UserFeedSubscriptionFromStorageSchema = z.union([
  RssUserFeedSubscriptionFromStorageSchema,
  YouTubeChannelUserFeedSubscriptionFromStorageSchema,
  IntervalUserFeedSubscriptionFromStorageSchema,
]);

/**
 * Type for a {@link UserFeedSubscription} persisted to Firestore.
 */
export type UserFeedSubscriptionFromStorage = z.infer<typeof UserFeedSubscriptionFromStorageSchema>;
