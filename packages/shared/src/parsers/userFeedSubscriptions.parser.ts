import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult, toStorageTimestamp} from '@shared/lib/parser.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import {parseFeedSourceId} from '@shared/parsers/feedSources.parser';
import {parseUserId} from '@shared/parsers/user.parser';

import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import {
  UserFeedSubscriptionFromStorageSchema,
  UserFeedSubscriptionIdSchema,
} from '@shared/types/userFeedSubscriptions.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionFromStorage,
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
  const parsedResult = parseZodResult(
    UserFeedSubscriptionFromStorageSchema,
    maybeUserFeedSubscription
  );
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
        ? parseStorageTimestamp(parsedResult.value.unsubscribedTime)
        : undefined,
      createdTime: parseStorageTimestamp(parsedResult.value.createdTime),
      lastUpdatedTime: parseStorageTimestamp(parsedResult.value.lastUpdatedTime),
    })
  );
}

/**
 * Converts a {@link UserFeedSubscription} to a {@link UserFeedSubscriptionFromStorage} object that can
 * be persisted to Firestore.
 */
export function toStorageUserFeedSubscription(
  userFeedSubscription: UserFeedSubscription
): UserFeedSubscriptionFromStorage {
  return {
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    feedSourceId: userFeedSubscription.feedSourceId,
    userId: userFeedSubscription.userId,
    url: userFeedSubscription.url,
    title: userFeedSubscription.title,
    isActive: userFeedSubscription.isActive,
    unsubscribedTime: userFeedSubscription.unsubscribedTime
      ? toStorageTimestamp(userFeedSubscription.unsubscribedTime)
      : undefined,
    createdTime: toStorageTimestamp(userFeedSubscription.createdTime),
    lastUpdatedTime: toStorageTimestamp(userFeedSubscription.lastUpdatedTime),
  };
}
