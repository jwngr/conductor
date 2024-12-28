import {z} from 'zod';

import {parseZodResult, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeId} from '@shared/lib/utils.shared';

import {
  FeedSourceIdSchema,
  parseFeedSourceId,
  type FeedSource,
  type FeedSourceId,
} from '@shared/types/feedSources.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import {parseUserId, UserIdSchema, type UserId} from '@shared/types/user.types';
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
  url: z.string(),
  title: z.string(),
  isActive: z.boolean(),
  unsubscribedTime: z.string().datetime(),
  createdTime: z.string().datetime(),
  lastUpdatedTime: z.string().datetime(),
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
  readonly unsubscribedTime?: Timestamp;
}

/**
 * Parses a {@link UserFeedSubscriptionId} from a plain string. Returns an `ErrorResult` if the
 * string is not valid.
 */
export function parseUserFeedSubscriptionId(
  maybeUserFeedSubscriptionId: string
): Result<UserFeedSubscriptionId> {
  const parsedResult = parseZodResult(UserFeedSubscriptionIdSchema, maybeUserFeedSubscriptionId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription ID');
  }
  return makeSuccessResult(parsedResult.value as UserFeedSubscriptionId);
}

/**
 * Creates a new random {@link UserFeedSubscriptionId}.
 */
export function makeUserFeedSubscriptionId(): UserFeedSubscriptionId {
  return makeId() as UserFeedSubscriptionId;
}

/**
 * Parses a {@link UserFeedSubscription} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
export function parseUserFeedSubscription(
  maybeUserFeedSubscription: unknown
): Result<UserFeedSubscription> {
  const parsedResult = parseZodResult(UserFeedSubscriptionSchema, maybeUserFeedSubscription);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription');
  }

  const parsedUserIdResult = parseUserId(parsedResult.value.userId);
  if (!parsedUserIdResult.success) return parsedUserIdResult;

  const parsedFeedSourceIdResult = parseFeedSourceId(parsedResult.value.feedSourceId);
  if (!parsedFeedSourceIdResult.success) return parsedFeedSourceIdResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  const {url, title, isActive, unsubscribedTime, createdTime, lastUpdatedTime} = parsedResult.value;
  return makeSuccessResult({
    userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
    feedSourceId: parsedFeedSourceIdResult.value,
    userId: parsedUserIdResult.value,
    url,
    title,
    isActive,
    unsubscribedTime: new Date(unsubscribedTime) as unknown as Timestamp,
    createdTime: new Date(createdTime) as unknown as Timestamp,
    lastUpdatedTime: new Date(lastUpdatedTime) as unknown as Timestamp,
  });
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
