import {z} from 'zod';

import {makeUuid} from '@shared/lib/utils.shared';

import {
  FeedSourceIdSchema,
  type FeedSource,
  type FeedSourceId,
} from '@shared/types/feedSources.types';
import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import {UserIdSchema} from '@shared/types/user.types';
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
 * An individual user's subscription to a feed source.
 *
 * A single {@link FeedSource} can have multiple {@link UserFeedSubscription}s, one for each
 * {@link User} subscribed to it.
 *
 * These are not deleted when a user unsubscribes from a feed. Instead, they are marked as
 * inactive. They are only deleted when a user is wiped out.
 */
export interface UserFeedSubscription extends BaseStoreItem {
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly feedSourceId: FeedSourceId;
  readonly userId: UserId;
  readonly url: string;
  readonly title: string;
  readonly isActive: boolean;
  readonly unsubscribedTime?: Date | undefined;
}

/**
 * Zod schema for a {@link UserFeedSubscription}.
 */
export const UserFeedSubscriptionSchema = z.object({
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  feedSourceId: FeedSourceIdSchema,
  userId: UserIdSchema,
  url: z.string().url(),
  title: z.string().min(1),
  isActive: z.boolean(),
  unsubscribedTime: FirestoreTimestampSchema.optional(),
  createdTime: FirestoreTimestampSchema,
  lastUpdatedTime: FirestoreTimestampSchema,
});

export type UserFeedSubscriptionFromSchema = z.infer<typeof UserFeedSubscriptionSchema>;

/**
 * Creates a new {@link UserFeedSubscription} object.
 */
export function makeUserFeedSubscription(args: {
  readonly feedSource: FeedSource;
  readonly userId: UserId;
}): Result<UserFeedSubscription> {
  const {feedSource, userId} = args;

  const userFeedSubscription: UserFeedSubscription = {
    userFeedSubscriptionId: makeUserFeedSubscriptionId(),
    userId,
    feedSourceId: feedSource.feedSourceId,
    url: feedSource.url,
    title: feedSource.title,
    isActive: true,
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };

  return makeSuccessResult(userFeedSubscription);
}
