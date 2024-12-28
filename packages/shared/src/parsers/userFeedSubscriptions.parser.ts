import {parseZodResult, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeUuid} from '@shared/lib/utils.shared';

import {parseFeedSourceId} from '@shared/parsers/feedSources.parser';
import {parseUserId} from '@shared/parsers/user.parser';

import type {FeedSource} from '@shared/types/feedSources.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import {
  UserFeedSubscriptionIdSchema,
  UserFeedSubscriptionSchema,
} from '@shared/types/userFeedSubscriptions.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import type {Timestamp} from '@shared/types/utils.types';

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
  return makeUuid<UserFeedSubscriptionId>();
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
    unsubscribedTime: unsubscribedTime
      ? (new Date(unsubscribedTime) as unknown as Timestamp)
      : undefined,
    createdTime: new Date(createdTime) as unknown as Timestamp,
    lastUpdatedTime: new Date(lastUpdatedTime) as unknown as Timestamp,
  });
}

/**
 * Creates a new {@link UserFeedSubscription} object.
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
