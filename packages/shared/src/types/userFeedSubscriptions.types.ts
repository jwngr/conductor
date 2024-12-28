import {z} from 'zod';

import {makeUuid} from '@shared/lib/utils.shared';

import {
  FeedSourceIdSchema,
  type FeedSource,
  type FeedSourceId,
} from '@shared/types/feedSources.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import {UserIdSchema} from '@shared/types/user.types';
import type {BaseStoreItem, Timestamp} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a {@link UserFeedSubscription}'s unique identifier. Prefer this over
 * plain strings.
 */
export type UserFeedSubscriptionId = string & {readonly __brand: 'UserFeedSubscriptionIdBrand'};

export const UserFeedSubscriptionIdSchema = z.string().uuid();

export const UserFeedSubscriptionSchema = z.object({
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  feedSourceId: FeedSourceIdSchema,
  userId: UserIdSchema,
  url: z.string().url(),
  title: z.string().min(1),
  isActive: z.boolean(),
  unsubscribedTime: z.date().nullable(),
  createdTime: z.date(),
  lastUpdatedTime: z.date(),
});

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
  readonly unsubscribedTime?: Timestamp | undefined;
}

/**
 * Creates a new random {@link UserFeedSubscriptionId}.
 */
export function makeUserFeedSubscriptionId(): UserFeedSubscriptionId {
  return makeUuid<UserFeedSubscriptionId>();
}

/**
 * Creates a {@link UserFeedSubscription} object.
 */
export function makeUserFeedSubscription(args: {
  readonly feedSource: FeedSource;
  readonly userId: UserId;
  readonly createdTime: Timestamp;
  readonly lastUpdatedTime: Timestamp;
}): Result<UserFeedSubscription> {
  const {feedSource, userId, createdTime, lastUpdatedTime} = args;

  const userFeedSubscription: UserFeedSubscription = {
    userFeedSubscriptionId: makeUserFeedSubscriptionId(),
    userId,
    feedSourceId: feedSource.feedSourceId,
    url: feedSource.url,
    title: feedSource.title,
    isActive: true,
    createdTime,
    lastUpdatedTime,
  };

  return makeSuccessResult(userFeedSubscription);
}
