import {z} from 'zod';

import type {AccountId} from '@shared/types/accounts.types';
import {AccountIdSchema} from '@shared/types/accounts.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import {DeliveryScheduleFromStorageSchema} from '@shared/types/deliverySchedules.types';
import type {
  ExtensionFeedSource,
  IntervalMiniFeedSource,
  MiniFeedSource,
  PocketExportFeedSource,
  PWAFeedSource,
  RssMiniFeedSource,
  YouTubeChannelMiniFeedSource,
} from '@shared/types/feedSources.types';
import {
  EXTENSION_FEED_SOURCE,
  ExtensionMiniFeedSourceSchema,
  IntervalMiniFeedSourceSchema,
  MiniFeedSourceFromStorageSchema,
  POCKET_EXPORT_FEED_SOURCE,
  PocketExportMiniFeedSourceSchema,
  PWA_FEED_SOURCE,
  PWAMiniFeedSourceSchema,
  RssMiniFeedSourceSchema,
  YouTubeChannelMiniFeedSourceSchema,
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

export interface PWAUserFeedSubscription extends BaseUserFeedSubscription {
  readonly miniFeedSource: PWAFeedSource;
}

export interface ExtensionUserFeedSubscription extends BaseUserFeedSubscription {
  readonly miniFeedSource: ExtensionFeedSource;
}

export interface PocketExportUserFeedSubscription extends BaseUserFeedSubscription {
  readonly miniFeedSource: PocketExportFeedSource;
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
  | PocketExportUserFeedSubscription
  | PWAUserFeedSubscription
  | ExtensionUserFeedSubscription
  | RssUserFeedSubscription
  | YouTubeChannelUserFeedSubscription;

/**
 * Zod schema for a {@link UserFeedSubscription} persisted to Firestore.
 */
export const UserFeedSubscriptionFromStorageSchema = z.object({
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  feedSource: MiniFeedSourceFromStorageSchema,
  accountId: AccountIdSchema,
  url: z.string().url(),
  title: z.string(),
  isActive: z.boolean(),
  unsubscribedTime: FirestoreTimestampSchema.or(z.date()).optional(),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
  deliverySchedule: DeliveryScheduleFromStorageSchema,
});

/**
 * Type for a {@link UserFeedSubscription} persisted to Firestore.
 */
export type UserFeedSubscriptionFromStorage = z.infer<typeof UserFeedSubscriptionFromStorageSchema>;

////////////////////////////////
//  MiniUserFeedSubscription  //
////////////////////////////////
export interface PWAMiniUserFeedSubscription {
  readonly feedSource: PWAFeedSource;
}

export const PWA_MINI_USER_FEED_SUBSCRIPTION: PWAMiniUserFeedSubscription = {
  feedSource: PWA_FEED_SOURCE,
};

export interface ExtensionMiniUserFeedSubscription {
  readonly feedSource: ExtensionFeedSource;
}

export const EXTENSION_MINI_USER_FEED_SUBSCRIPTION: ExtensionMiniUserFeedSubscription = {
  feedSource: EXTENSION_FEED_SOURCE,
};

export interface PocketExportMiniUserFeedSubscription {
  readonly feedSource: PocketExportFeedSource;
}

export const POCKET_EXPORT_MINI_USER_FEED_SUBSCRIPTION: PocketExportMiniUserFeedSubscription = {
  feedSource: POCKET_EXPORT_FEED_SOURCE,
};

type BasePersistedMiniUserFeedSubscription = Pick<
  UserFeedSubscription,
  'userFeedSubscriptionId' | 'isActive'
>;

export interface RssMiniUserFeedSubscription extends BasePersistedMiniUserFeedSubscription {
  readonly feedSource: RssMiniFeedSource;
}

export interface YouTubeChannelMiniUserFeedSubscription
  extends BasePersistedMiniUserFeedSubscription {
  readonly feedSource: YouTubeChannelMiniFeedSource;
}

export interface IntervalMiniUserFeedSubscription extends BasePersistedMiniUserFeedSubscription {
  readonly feedSource: IntervalMiniFeedSource;
}

export type MiniUserFeedSubscription =
  | PWAMiniUserFeedSubscription
  | ExtensionMiniUserFeedSubscription
  | PocketExportMiniUserFeedSubscription
  | RssMiniUserFeedSubscription
  | YouTubeChannelMiniUserFeedSubscription
  | IntervalMiniUserFeedSubscription;

const PWAMiniUserFeedSubscriptionSchema = z.object({
  feedSource: PWAMiniFeedSourceSchema,
});

const ExtensionMiniUserFeedSubscriptionSchema = z.object({
  feedSource: ExtensionMiniFeedSourceSchema,
});

const PocketExportMiniUserFeedSubscriptionSchema = z.object({
  feedSource: PocketExportMiniFeedSourceSchema,
});

const PersistedMiniUserFeedSubscriptionSchema = z.object({
  feedSource: z.union([
    RssMiniFeedSourceSchema,
    YouTubeChannelMiniFeedSourceSchema,
    IntervalMiniFeedSourceSchema,
  ]),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  isActive: z.boolean(),
});

/**
 * Zod schema for a {@link UserFeedSubscription} persisted to Firestore.
 */
export const MiniUserFeedSubscriptionFromStorageSchema = z.union([
  PWAMiniUserFeedSubscriptionSchema,
  ExtensionMiniUserFeedSubscriptionSchema,
  PocketExportMiniUserFeedSubscriptionSchema,
  PersistedMiniUserFeedSubscriptionSchema,
]);
