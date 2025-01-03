import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {
  parseFirestoreTimestamp,
  parseZodResult,
  toFirestoreTimestamp,
} from '@shared/lib/parser.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import {parseFeedSourceId} from '@shared/parsers/feedSources.parser';
import {parseUserId} from '@shared/parsers/user.parser';

import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import {
  UserFeedSubscriptionIdSchema,
  UserFeedSubscriptionSchema,
} from '@shared/types/userFeedSubscriptions.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionFromSchema,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

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

  return makeSuccessResult(
    omitUndefined({
      userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
      feedSourceId: parsedFeedSourceIdResult.value,
      userId: parsedUserIdResult.value,
      url: parsedResult.value.url,
      title: parsedResult.value.title,
      isActive: parsedResult.value.isActive,
      unsubscribedTime: parsedResult.value.unsubscribedTime
        ? parseFirestoreTimestamp(parsedResult.value.unsubscribedTime)
        : undefined,
      createdTime: parseFirestoreTimestamp(parsedResult.value.createdTime),
      lastUpdatedTime: parseFirestoreTimestamp(parsedResult.value.lastUpdatedTime),
    })
  );
}

export function toFirestoreUserFeedSubscription(
  userFeedSubscription: UserFeedSubscription
): UserFeedSubscriptionFromSchema {
  return {
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    feedSourceId: userFeedSubscription.feedSourceId,
    userId: userFeedSubscription.userId,
    url: userFeedSubscription.url,
    title: userFeedSubscription.title,
    isActive: userFeedSubscription.isActive,
    unsubscribedTime: userFeedSubscription.unsubscribedTime
      ? toFirestoreTimestamp(userFeedSubscription.unsubscribedTime)
      : undefined,
    createdTime: toFirestoreTimestamp(userFeedSubscription.createdTime),
    lastUpdatedTime: toFirestoreTimestamp(userFeedSubscription.lastUpdatedTime),
  };
}
