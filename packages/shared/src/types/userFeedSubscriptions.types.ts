import {z} from 'zod';

import {makeSuccessResult} from '@shared/lib/results.shared';
import {makeUuid} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {AccountIdSchema} from '@shared/types/accounts.types';
import {
  FeedSourceIdSchema,
  type FeedSource,
  type FeedSourceId,
} from '@shared/types/feedSources.types';
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
 * An individual account's subscription to a feed source.
 *
 * A single {@link FeedSource} can have multiple {@link UserFeedSubscription}s, one for each
 * {@link Account} subscribed to it.
 *
 * These are not deleted when an account unsubscribes from a feed. Instead, they are marked as
 * inactive. They are only deleted when an account is wiped out.
 */
export interface UserFeedSubscription extends BaseStoreItem {
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly feedSourceId: FeedSourceId;
  readonly accountId: AccountId;
  readonly url: string;
  readonly title: string;
  readonly isActive: boolean;
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
  const userFeedSubscription: UserFeedSubscription = {
    userFeedSubscriptionId: makeUserFeedSubscriptionId(),
    accountId: newItemArgs.accountId,
    feedSourceId: newItemArgs.feedSource.feedSourceId,
    url: newItemArgs.feedSource.url,
    title: newItemArgs.feedSource.title,
    isActive: true,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };

  return makeSuccessResult(userFeedSubscription);
}
