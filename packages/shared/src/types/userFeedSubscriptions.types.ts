import {z} from 'zod';

import type {AccountId} from '@shared/types/accounts.types';
import {AccountIdSchema} from '@shared/types/accounts.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import {DeliveryScheduleFromStorageSchema} from '@shared/types/deliverySchedules.types';
import type {
  ExtensionFeedSource,
  MiniFeedSource,
  PersistedFeedSource,
  PocketExportFeedSource,
  PWAFeedSource,
} from '@shared/types/feedSources.types';
import {
  EXTENSION_FEED_SOURCE,
  POCKET_EXPORT_FEED_SOURCE,
  PWA_FEED_SOURCE,
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
 * A single {@link PersistedFeedSource} can have multiple {@link UserFeedSubscription}s, one for
 * each {@link Account} subscribed to it.
 *
 * These are not deleted when an account unsubscribes from a feed. Instead, they are marked as
 * inactive. They are only deleted when an account is wiped out.
 */
export interface UserFeedSubscription extends BaseStoreItem {
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly feedSource: MiniFeedSource;
  readonly accountId: AccountId;
  readonly isActive: boolean;
  readonly deliverySchedule: DeliverySchedule;
  readonly unsubscribedTime?: Date | undefined;
}

type BaseMiniUserFeedSubscription = Pick<UserFeedSubscription, 'feedSource'>;

interface PWAMiniUserFeedSubscription extends BaseMiniUserFeedSubscription {
  readonly feedSource: PWAFeedSource;
}

export const PWA_MINI_USER_FEED_SUBSCRIPTION: PWAMiniUserFeedSubscription = {
  feedSource: PWA_FEED_SOURCE,
};

interface ExtensionMiniUserFeedSubscription extends BaseMiniUserFeedSubscription {
  readonly feedSource: ExtensionFeedSource;
}

export const EXTENSION_MINI_USER_FEED_SUBSCRIPTION: ExtensionMiniUserFeedSubscription = {
  feedSource: EXTENSION_FEED_SOURCE,
};

interface PocketExportMiniUserFeedSubscription extends BaseMiniUserFeedSubscription {
  readonly feedSource: PocketExportFeedSource;
}

export const POCKET_EXPORT_MINI_USER_FEED_SUBSCRIPTION: PocketExportMiniUserFeedSubscription = {
  feedSource: POCKET_EXPORT_FEED_SOURCE,
};

interface PersistedMiniUserFeedSubscription
  extends BaseMiniUserFeedSubscription,
    Pick<UserFeedSubscription, 'userFeedSubscriptionId' | 'isActive'> {
  feedSource: PersistedFeedSource;
}

export type MiniUserFeedSubscription =
  | PWAMiniUserFeedSubscription
  | ExtensionMiniUserFeedSubscription
  | PocketExportMiniUserFeedSubscription
  | PersistedMiniUserFeedSubscription;

/**
 * Zod schema for a {@link UserFeedSubscription} persisted to Firestore.
 */
export const UserFeedSubscriptionFromStorageSchema = z.object({
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  feedSource: MiniFeedSourceSchema,
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
