import {z} from 'zod';

import type {AccountId} from '@shared/types/accounts.types';
import {AccountIdSchema} from '@shared/types/accounts.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import {DeliveryScheduleFromStorageSchema} from '@shared/types/deliverySchedules.types';
import {
  EXTENSION_FEED_SOURCE,
  ExtensionMiniFeedSourceSchema,
  FeedSourceType,
  IntervalMiniFeedSourceSchema,
  MiniFeedSourceFromStorageSchema,
  POCKET_EXPORT_FEED_SOURCE,
  PocketExportMiniFeedSourceSchema,
  PWA_FEED_SOURCE,
  PWAMiniFeedSourceSchema,
  RssMiniFeedSourceSchema,
  YouTubeChannelMiniFeedSourceSchema,
} from '@shared/types/feedSources.types';
import type {
  ExtensionFeedSource,
  IntervalMiniFeedSource,
  MiniFeedSource,
  PocketExportFeedSource,
  PWAFeedSource,
  RssMiniFeedSource,
  YouTubeChannelMiniFeedSource,
} from '@shared/types/feedSources.types';
import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

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
 * A single {@link FeedSource} can have multiple {@link UserFeedSubscription}s, one for each
 * {@link Account} subscribed to it.
 *
 * Only {@link PersistedFeedSource}s can have {@link UserFeedSubscription}s. In-memory feed sources
 * do not have one.
 *
 * User feed subscriptions are not deleted when an account unsubscribes from a feed. Instead, they
 * are marked as inactive. They are only deleted when an account is wiped out.
 */
interface BaseUserFeedSubscription extends BaseStoreItem {
  /** The unique identifier for this subscription. */
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  /** A subset of the {@link FeedSource} that this subscription corresponds to. */
  readonly miniFeedSource: MiniFeedSource;
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
  readonly miniFeedSource: RssMiniFeedSource;
}

export interface YouTubeChannelUserFeedSubscription extends BaseUserFeedSubscription {
  readonly miniFeedSource: YouTubeChannelMiniFeedSource;
}

export interface IntervalUserFeedSubscription extends BaseUserFeedSubscription {
  readonly miniFeedSource: IntervalMiniFeedSource;
}

export type UserFeedSubscription =
  | IntervalUserFeedSubscription
  | RssUserFeedSubscription
  | YouTubeChannelUserFeedSubscription;

/**
 * Zod schema for a {@link UserFeedSubscription} persisted to Firestore.
 */
const BaseUserFeedSubscriptionFromStorageSchema = z.object({
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  miniFeedSource: MiniFeedSourceFromStorageSchema,
  accountId: AccountIdSchema,
  isActive: z.boolean(),
  deliverySchedule: DeliveryScheduleFromStorageSchema,
  unsubscribedTime: FirestoreTimestampSchema.or(z.date()).optional(),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

export const RssUserFeedSubscriptionFromStorageSchema =
  BaseUserFeedSubscriptionFromStorageSchema.extend({
    miniFeedSource: RssMiniFeedSourceSchema,
  });

export const YouTubeChannelUserFeedSubscriptionFromStorageSchema =
  BaseUserFeedSubscriptionFromStorageSchema.extend({
    miniFeedSource: YouTubeChannelMiniFeedSourceSchema,
  });

export const IntervalUserFeedSubscriptionFromStorageSchema =
  BaseUserFeedSubscriptionFromStorageSchema.extend({
    miniFeedSource: IntervalMiniFeedSourceSchema,
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
  readonly miniFeedSource: PWAFeedSource;
}

export const PWA_MINI_USER_FEED_SUBSCRIPTION: PWAMiniUserFeedSubscription = {
  type: FeedSourceType.PWA,
  miniFeedSource: PWA_FEED_SOURCE,
};

export interface ExtensionMiniUserFeedSubscription {
  readonly type: FeedSourceType.Extension;
  readonly miniFeedSource: ExtensionFeedSource;
}

export const EXTENSION_MINI_USER_FEED_SUBSCRIPTION: ExtensionMiniUserFeedSubscription = {
  type: FeedSourceType.Extension,
  miniFeedSource: EXTENSION_FEED_SOURCE,
};

export interface PocketExportMiniUserFeedSubscription {
  readonly type: FeedSourceType.PocketExport;
  readonly miniFeedSource: PocketExportFeedSource;
}

export const POCKET_EXPORT_MINI_USER_FEED_SUBSCRIPTION: PocketExportMiniUserFeedSubscription = {
  type: FeedSourceType.PocketExport,
  miniFeedSource: POCKET_EXPORT_FEED_SOURCE,
};

type BasePersistedMiniUserFeedSubscription = Pick<
  UserFeedSubscription,
  'userFeedSubscriptionId' | 'isActive'
>;

export interface RssMiniUserFeedSubscription extends BasePersistedMiniUserFeedSubscription {
  readonly type: FeedSourceType.RSS;
  readonly miniFeedSource: RssMiniFeedSource;
}

export interface YouTubeChannelMiniUserFeedSubscription
  extends BasePersistedMiniUserFeedSubscription {
  readonly type: FeedSourceType.YouTubeChannel;
  readonly miniFeedSource: YouTubeChannelMiniFeedSource;
}

export interface IntervalMiniUserFeedSubscription extends BasePersistedMiniUserFeedSubscription {
  readonly type: FeedSourceType.Interval;
  readonly miniFeedSource: IntervalMiniFeedSource;
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
  miniFeedSource: PWAMiniFeedSourceSchema,
});

const ExtensionMiniUserFeedSubscriptionSchema = z.object({
  type: z.literal(FeedSourceType.Extension),
  miniFeedSource: ExtensionMiniFeedSourceSchema,
});

const PocketExportMiniUserFeedSubscriptionSchema = z.object({
  type: z.literal(FeedSourceType.PocketExport),
  miniFeedSource: PocketExportMiniFeedSourceSchema,
});

const BasePersistedMiniUserFeedSubscriptionSchema = z.object({
  type: z.union([
    z.literal(FeedSourceType.RSS),
    z.literal(FeedSourceType.YouTubeChannel),
    z.literal(FeedSourceType.Interval),
  ]),
  miniFeedSource: z.union([
    RssMiniFeedSourceSchema,
    YouTubeChannelMiniFeedSourceSchema,
    IntervalMiniFeedSourceSchema,
    PWAMiniFeedSourceSchema,
  ]),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  isActive: z.boolean(),
});

export const RssMiniUserFeedSubscriptionSchema = BasePersistedMiniUserFeedSubscriptionSchema.extend(
  {
    type: z.literal(FeedSourceType.RSS),
    miniFeedSource: RssMiniFeedSourceSchema,
  }
);

export const YouTubeChannelMiniUserFeedSubscriptionSchema =
  BasePersistedMiniUserFeedSubscriptionSchema.extend({
    type: z.literal(FeedSourceType.YouTubeChannel),
    miniFeedSource: YouTubeChannelMiniFeedSourceSchema,
  });

export const IntervalMiniUserFeedSubscriptionSchema =
  BasePersistedMiniUserFeedSubscriptionSchema.extend({
    type: z.literal(FeedSourceType.Interval),
    miniFeedSource: IntervalMiniFeedSourceSchema,
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

/**
 * Type for a {@link MiniUserFeedSubscription} persisted to Firestore.
 */
export type MiniUserFeedSubscriptionFromStorage = z.infer<
  typeof MiniUserFeedSubscriptionFromStorageSchema
>;
