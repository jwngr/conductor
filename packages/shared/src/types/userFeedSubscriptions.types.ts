import {z} from 'zod';

import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {makeUuid} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {AccountIdSchema} from '@shared/types/accounts.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import {DeliveryScheduleFromStorageSchema} from '@shared/types/deliverySchedules.types';
import type {FeedSource, FeedSourceId} from '@shared/types/feedSources.types';
import {FeedSourceIdSchema} from '@shared/types/feedSources.types';
import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {Result} from '@shared/types/results.types';
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
 * Creates a new random {@link UserFeedSubscriptionId}.
 */
export function makeUserFeedSubscriptionId(): UserFeedSubscriptionId {
  return makeUuid<UserFeedSubscriptionId>();
}

/**
 * A sentinel {@link UserFeedSubscriptionId} used for feed subscriptions that failed parsing.
 */
export const INVALID_USER_FEED_SUBSCRIPTION_ID = 'INVALID_USER_FEED_SUBSCRIPTION_ID';

/**
 * An individual account's subscription to a feed source.
 *
 * A single {@link FeedSource} can have multiple {@link UserFeedSubscription}s, one for each
 * {@link Account} subscribed to it.
 *
 * These are not deleted when an account unsubscribes from a feed. Instead, they are marked as
 * inactive. They are only deleted when an account is wiped out.
 */
export interface UserFeedSubscription extends BaseStoreItem {
  // HEREREERERE
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly feedSourceId: FeedSourceId;
  readonly accountId: AccountId;
  readonly url: string;
  readonly title: string;
  readonly isActive: boolean;
  // AND HERE
  readonly deliverySchedule: DeliverySchedule;
  readonly unsubscribedTime?: Date | undefined;
}

/**
 * Zod schema for a {@link UserFeedSubscription} persisted to Firestore.
 */
export const UserFeedSubscriptionFromStorageSchema = z.object({
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  feedSourceId: FeedSourceIdSchema,
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

/**
 * Creates a new {@link UserFeedSubscription} object.
 */
export function makeUserFeedSubscription(newItemArgs: {
  readonly feedSource: FeedSource;
  readonly accountId: AccountId;
}): Result<UserFeedSubscription> {
  const {feedSource, accountId} = newItemArgs;

  const userFeedSubscriptionId = makeUserFeedSubscriptionId();

  const userFeedSubscription: UserFeedSubscription = {
    userFeedSubscriptionId,
    accountId,
    feedSourceId: feedSource.feedSourceId,
    url: feedSource.url,
    title: feedSource.title,
    isActive: true,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };

  return makeSuccessResult(userFeedSubscription);
}
