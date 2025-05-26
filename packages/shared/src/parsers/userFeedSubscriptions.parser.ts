import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {
  parseDeliverySchedule,
  toStorageDeliverySchedule,
} from '@shared/parsers/deliverySchedules.parser';
import {parseYouTubeChannelId} from '@shared/parsers/youtube.parser';

import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {Result} from '@shared/types/results.types';
import type {
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  UserFeedSubscription,
  UserFeedSubscriptionId,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';

import {
  IntervalUserFeedSubscriptionFromStorageSchema,
  RssUserFeedSubscriptionFromStorageSchema,
  UserFeedSubscriptionFromStorageSchema,
  UserFeedSubscriptionIdSchema,
  YouTubeChannelUserFeedSubscriptionFromStorageSchema,
} from '@shared/schemas/userFeedSubscriptions.schema';
import type {UserFeedSubscriptionFromStorage} from '@shared/schemas/userFeedSubscriptions.schema';

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

  switch (parsedResult.value.feedSourceType) {
    case FeedSourceType.RSS:
      return parseRssUserFeedSubscription(parsedResult.value);
    case FeedSourceType.YouTubeChannel:
      return parseYouTubeChannelUserFeedSubscription(parsedResult.value);
    case FeedSourceType.Interval:
      return parseIntervalUserFeedSubscription(parsedResult.value);
    default:
      return makeErrorResult(new Error('Unexpected feed source type'));
  }
}

function parseRssUserFeedSubscription(
  maybeUserFeedSubscription: unknown
): Result<RssUserFeedSubscription> {
  const parsedResult = parseZodResult(
    RssUserFeedSubscriptionFromStorageSchema,
    maybeUserFeedSubscription
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription');
  }

  const parsedAccountIdResult = parseAccountId(parsedResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(parsedResult.value.deliverySchedule);
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  return makeSuccessResult(
    omitUndefined({
      feedSourceType: FeedSourceType.RSS,
      url: parsedResult.value.url,
      title: parsedResult.value.title,
      userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
      accountId: parsedAccountIdResult.value,
      isActive: parsedResult.value.isActive,
      deliverySchedule: parsedDeliveryScheduleResult.value,
      createdTime: parseStorageTimestamp(parsedResult.value.createdTime),
      lastUpdatedTime: parseStorageTimestamp(parsedResult.value.lastUpdatedTime),
      unsubscribedTime: parsedResult.value.unsubscribedTime
        ? parseStorageTimestamp(parsedResult.value.unsubscribedTime)
        : undefined,
    })
  );
}

function parseYouTubeChannelUserFeedSubscription(
  maybeUserFeedSubscription: unknown
): Result<YouTubeChannelUserFeedSubscription> {
  const parsedResult = parseZodResult(
    YouTubeChannelUserFeedSubscriptionFromStorageSchema,
    maybeUserFeedSubscription
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription');
  }

  const parsedAccountIdResult = parseAccountId(parsedResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(parsedResult.value.deliverySchedule);
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  const parsedChannelIdResult = parseYouTubeChannelId(parsedResult.value.channelId);
  if (!parsedChannelIdResult.success) return parsedChannelIdResult;

  return makeSuccessResult(
    omitUndefined({
      feedSourceType: FeedSourceType.YouTubeChannel,
      channelId: parsedChannelIdResult.value,
      userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
      accountId: parsedAccountIdResult.value,
      isActive: parsedResult.value.isActive,
      deliverySchedule: parsedDeliveryScheduleResult.value,
      createdTime: parseStorageTimestamp(parsedResult.value.createdTime),
      lastUpdatedTime: parseStorageTimestamp(parsedResult.value.lastUpdatedTime),
      unsubscribedTime: parsedResult.value.unsubscribedTime
        ? parseStorageTimestamp(parsedResult.value.unsubscribedTime)
        : undefined,
    })
  );
}

function parseIntervalUserFeedSubscription(
  maybeUserFeedSubscription: unknown
): Result<IntervalUserFeedSubscription> {
  const parsedResult = parseZodResult(
    IntervalUserFeedSubscriptionFromStorageSchema,
    maybeUserFeedSubscription
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription');
  }

  const parsedAccountIdResult = parseAccountId(parsedResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(parsedResult.value.deliverySchedule);
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  return makeSuccessResult(
    omitUndefined({
      feedSourceType: FeedSourceType.Interval,
      intervalSeconds: parsedResult.value.intervalSeconds,
      userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
      accountId: parsedAccountIdResult.value,
      isActive: parsedResult.value.isActive,
      deliverySchedule: parsedDeliveryScheduleResult.value,
      createdTime: parseStorageTimestamp(parsedResult.value.createdTime),
      lastUpdatedTime: parseStorageTimestamp(parsedResult.value.lastUpdatedTime),
      unsubscribedTime: parsedResult.value.unsubscribedTime
        ? parseStorageTimestamp(parsedResult.value.unsubscribedTime)
        : undefined,
    })
  );
}

/**
 * Converts a {@link UserFeedSubscription} to a {@link UserFeedSubscriptionFromStorage} object that
 * can be persisted to Firestore.
 */
export function toStorageUserFeedSubscription(
  userFeedSubscription: UserFeedSubscription
): UserFeedSubscriptionFromStorage {
  switch (userFeedSubscription.feedSourceType) {
    case FeedSourceType.RSS:
      return toStorageRssUserFeedSubscription(userFeedSubscription);
    case FeedSourceType.YouTubeChannel:
      return toStorageYouTubeChannelUserFeedSubscription(userFeedSubscription);
    case FeedSourceType.Interval:
      return toStorageIntervalUserFeedSubscription(userFeedSubscription);
    default:
      // TODO: More safely handle malformed user feed subscriptions.
      return {} as UserFeedSubscriptionFromStorage;
  }
}

function toStorageRssUserFeedSubscription(
  userFeedSubscription: RssUserFeedSubscription
): UserFeedSubscriptionFromStorage {
  return omitUndefined({
    feedSourceType: FeedSourceType.RSS,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    url: userFeedSubscription.url,
    title: userFeedSubscription.title,
    accountId: userFeedSubscription.accountId,
    isActive: userFeedSubscription.isActive,
    unsubscribedTime: userFeedSubscription.unsubscribedTime,
    createdTime: userFeedSubscription.createdTime,
    lastUpdatedTime: userFeedSubscription.lastUpdatedTime,
    deliverySchedule: toStorageDeliverySchedule(userFeedSubscription.deliverySchedule),
  });
}

function toStorageYouTubeChannelUserFeedSubscription(
  userFeedSubscription: YouTubeChannelUserFeedSubscription
): UserFeedSubscriptionFromStorage {
  return omitUndefined({
    feedSourceType: FeedSourceType.YouTubeChannel,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    channelId: userFeedSubscription.channelId,
    accountId: userFeedSubscription.accountId,
    isActive: userFeedSubscription.isActive,
    unsubscribedTime: userFeedSubscription.unsubscribedTime,
    createdTime: userFeedSubscription.createdTime,
    lastUpdatedTime: userFeedSubscription.lastUpdatedTime,
    deliverySchedule: toStorageDeliverySchedule(userFeedSubscription.deliverySchedule),
  });
}

function toStorageIntervalUserFeedSubscription(
  userFeedSubscription: IntervalUserFeedSubscription
): UserFeedSubscriptionFromStorage {
  return omitUndefined({
    feedSourceType: FeedSourceType.Interval,
    intervalSeconds: userFeedSubscription.intervalSeconds,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    accountId: userFeedSubscription.accountId,
    isActive: userFeedSubscription.isActive,
    unsubscribedTime: userFeedSubscription.unsubscribedTime,
    createdTime: userFeedSubscription.createdTime,
    lastUpdatedTime: userFeedSubscription.lastUpdatedTime,
    deliverySchedule: toStorageDeliverySchedule(userFeedSubscription.deliverySchedule),
  });
}
