import {z} from 'zod';

import type {AccountId} from '@shared/types/accounts.types';
import {AccountIdSchema} from '@shared/types/accounts.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import {DeliveryScheduleFromStorageSchema} from '@shared/types/deliverySchedules.types';
import {FeedSourceType} from '@shared/types/feedSources.types';
import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {BaseStoreItem} from '@shared/types/utils.types';
import {YouTubeChannelIdSchema, type YouTubeChannelId} from '@shared/types/youtube.types';

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
  readonly type: Exclude<
    FeedSourceType,
    // In-memory feed sources do not have a `UserFeedSubscription`.
    FeedSourceType.PWA | FeedSourceType.Extension | FeedSourceType.PocketExport
  >;
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
  readonly type: FeedSourceType.RSS;
  readonly url: string;
  readonly title: string;
}

export interface YouTubeChannelUserFeedSubscription extends BaseUserFeedSubscription {
  readonly type: FeedSourceType.YouTubeChannel;
  readonly channelId: YouTubeChannelId;
}

export interface IntervalUserFeedSubscription extends BaseUserFeedSubscription {
  readonly type: FeedSourceType.Interval;
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
  type: z.union([
    z.literal(FeedSourceType.RSS),
    z.literal(FeedSourceType.YouTubeChannel),
    z.literal(FeedSourceType.Interval),
  ]),
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
    type: z.literal(FeedSourceType.RSS),
    url: z.string(),
    title: z.string(),
  });

export const YouTubeChannelUserFeedSubscriptionFromStorageSchema =
  BaseUserFeedSubscriptionFromStorageSchema.extend({
    type: z.literal(FeedSourceType.YouTubeChannel),
    channelId: YouTubeChannelIdSchema,
  });

export const IntervalUserFeedSubscriptionFromStorageSchema =
  BaseUserFeedSubscriptionFromStorageSchema.extend({
    type: z.literal(FeedSourceType.Interval),
    intervalSeconds: z.number(),
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

////////////////////////////////
//  MiniUserFeedSubscription  //
////////////////////////////////
export interface PWAMiniUserFeedSubscription {
  readonly type: FeedSourceType.PWA;
}

export const PWA_MINI_USER_FEED_SUBSCRIPTION: PWAMiniUserFeedSubscription = {
  type: FeedSourceType.PWA,
};

export interface ExtensionMiniUserFeedSubscription {
  readonly type: FeedSourceType.Extension;
}

export const EXTENSION_MINI_USER_FEED_SUBSCRIPTION: ExtensionMiniUserFeedSubscription = {
  type: FeedSourceType.Extension,
};

export interface PocketExportMiniUserFeedSubscription {
  readonly type: FeedSourceType.PocketExport;
}

export const POCKET_EXPORT_MINI_USER_FEED_SUBSCRIPTION: PocketExportMiniUserFeedSubscription = {
  type: FeedSourceType.PocketExport,
};

type BasePersistedMiniUserFeedSubscription = Pick<
  UserFeedSubscription,
  'userFeedSubscriptionId' | 'isActive'
>;

export interface RssMiniUserFeedSubscription {
  readonly type: FeedSourceType.RSS;
  readonly url: string;
  readonly title: string;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly isActive: boolean;
}

export interface YouTubeChannelMiniUserFeedSubscription
  extends BasePersistedMiniUserFeedSubscription {
  readonly type: FeedSourceType.YouTubeChannel;
  readonly channelId: YouTubeChannelId;
}

export interface IntervalMiniUserFeedSubscription extends BasePersistedMiniUserFeedSubscription {
  readonly type: FeedSourceType.Interval;
  readonly intervalSeconds: number;
}

export type MiniUserFeedSubscription =
  | PWAMiniUserFeedSubscription
  | ExtensionMiniUserFeedSubscription
  | PocketExportMiniUserFeedSubscription
  | RssMiniUserFeedSubscription
  | YouTubeChannelMiniUserFeedSubscription
  | IntervalMiniUserFeedSubscription;

const PWAMiniUserFeedSubscriptionSchema = z.object({
  type: z.literal(FeedSourceType.PWA),
});

const ExtensionMiniUserFeedSubscriptionSchema = z.object({
  type: z.literal(FeedSourceType.Extension),
});

const PocketExportMiniUserFeedSubscriptionSchema = z.object({
  type: z.literal(FeedSourceType.PocketExport),
});

const BasePersistedMiniUserFeedSubscriptionSchema = z.object({
  type: z.union([
    z.literal(FeedSourceType.RSS),
    z.literal(FeedSourceType.YouTubeChannel),
    z.literal(FeedSourceType.Interval),
  ]),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  isActive: z.boolean(),
});

export const RssMiniUserFeedSubscriptionSchema = BasePersistedMiniUserFeedSubscriptionSchema.extend(
  {
    type: z.literal(FeedSourceType.RSS),
    url: z.string(),
    title: z.string(),
  }
);

export const YouTubeChannelMiniUserFeedSubscriptionSchema =
  BasePersistedMiniUserFeedSubscriptionSchema.extend({
    type: z.literal(FeedSourceType.YouTubeChannel),
    channelId: YouTubeChannelIdSchema,
  });

export const IntervalMiniUserFeedSubscriptionSchema =
  BasePersistedMiniUserFeedSubscriptionSchema.extend({
    type: z.literal(FeedSourceType.Interval),
    intervalSeconds: z.number(),
  });

/**
 * Zod schema for a {@link MiniUserFeedSubscription} persisted to Firestore.
 */
export const MiniUserFeedSubscriptionFromStorageSchema = z.union([
  PWAMiniUserFeedSubscriptionSchema,
  ExtensionMiniUserFeedSubscriptionSchema,
  PocketExportMiniUserFeedSubscriptionSchema,
  RssMiniUserFeedSubscriptionSchema,
  YouTubeChannelMiniUserFeedSubscriptionSchema,
  IntervalMiniUserFeedSubscriptionSchema,
]);

export const PersistedMiniUserFeedSubscriptionFromStorageSchema = z.union([
  RssMiniUserFeedSubscriptionSchema,
  YouTubeChannelMiniUserFeedSubscriptionSchema,
  IntervalMiniUserFeedSubscriptionSchema,
]);

/**
 * Type for a {@link MiniUserFeedSubscription} persisted to Firestore.
 */
export type MiniUserFeedSubscriptionFromStorage = z.infer<
  typeof MiniUserFeedSubscriptionFromStorageSchema
>;
