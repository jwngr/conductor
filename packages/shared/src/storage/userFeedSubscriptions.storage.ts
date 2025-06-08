import {parseStorageTimestamp} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseDeliverySchedule} from '@shared/parsers/deliverySchedules.parser';
import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';
import {parseYouTubeChannelId} from '@shared/parsers/youtube.parser';

import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {Result} from '@shared/types/results.types';
import type {
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  UserFeedSubscription,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';

import type {
  IntervalUserFeedSubscriptionFromStorage,
  RssUserFeedSubscriptionFromStorage,
  UserFeedSubscriptionFromStorage,
  YouTubeChannelUserFeedSubscriptionFromStorage,
} from '@shared/schemas/userFeedSubscriptions.schema';
import {toStorageDeliverySchedule} from '@shared/storage/deliverySchedules.storage';

/**
 * Converts a {@link UserFeedSubscription} into a {@link UserFeedSubscriptionFromStorage}.
 */
export function toStorageUserFeedSubscription(
  userFeedSubscription: UserFeedSubscription
): UserFeedSubscriptionFromStorage {
  switch (userFeedSubscription.feedSourceType) {
    case FeedSourceType.RSS:
      return {
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
      };
    case FeedSourceType.YouTubeChannel:
      return {
        feedSourceType: FeedSourceType.YouTubeChannel,
        userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
        channelId: userFeedSubscription.channelId,
        accountId: userFeedSubscription.accountId,
        isActive: userFeedSubscription.isActive,
        unsubscribedTime: userFeedSubscription.unsubscribedTime,
        createdTime: userFeedSubscription.createdTime,
        lastUpdatedTime: userFeedSubscription.lastUpdatedTime,
        deliverySchedule: toStorageDeliverySchedule(userFeedSubscription.deliverySchedule),
      };
    case FeedSourceType.Interval:
      return {
        feedSourceType: FeedSourceType.Interval,
        intervalSeconds: userFeedSubscription.intervalSeconds,
        userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
        accountId: userFeedSubscription.accountId,
        isActive: userFeedSubscription.isActive,
        unsubscribedTime: userFeedSubscription.unsubscribedTime,
        createdTime: userFeedSubscription.createdTime,
        lastUpdatedTime: userFeedSubscription.lastUpdatedTime,
        deliverySchedule: toStorageDeliverySchedule(userFeedSubscription.deliverySchedule),
      };
    default:
      assertNever(userFeedSubscription);
  }
}

/**
 * Converts a {@link UserFeedSubscriptionFromStorage} into a {@link UserFeedSubscription}.
 */
export function fromStorageUserFeedSubscription(
  userFeedSubscriptionFromStorage: UserFeedSubscriptionFromStorage
): Result<UserFeedSubscription, Error> {
  switch (userFeedSubscriptionFromStorage.feedSourceType) {
    case FeedSourceType.RSS:
      return fromStorageRssUserFeedSubscription(userFeedSubscriptionFromStorage);
    case FeedSourceType.YouTubeChannel:
      return fromStorageYouTubeChannelUserFeedSubscription(userFeedSubscriptionFromStorage);
    case FeedSourceType.Interval:
      return fromStorageIntervalUserFeedSubscription(userFeedSubscriptionFromStorage);
    default:
      assertNever(userFeedSubscriptionFromStorage);
  }
}

function fromStorageRssUserFeedSubscription(
  userFeedSubscriptionFromStorage: RssUserFeedSubscriptionFromStorage
): Result<RssUserFeedSubscription, Error> {
  const parsedAccountIdResult = parseAccountId(userFeedSubscriptionFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    userFeedSubscriptionFromStorage.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(
    userFeedSubscriptionFromStorage.deliverySchedule
  );
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  return makeSuccessResult({
    feedSourceType: FeedSourceType.RSS,
    url: userFeedSubscriptionFromStorage.url,
    title: userFeedSubscriptionFromStorage.title,
    userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
    accountId: parsedAccountIdResult.value,
    isActive: userFeedSubscriptionFromStorage.isActive,
    deliverySchedule: parsedDeliveryScheduleResult.value,
    createdTime: parseStorageTimestamp(userFeedSubscriptionFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(userFeedSubscriptionFromStorage.lastUpdatedTime),
    unsubscribedTime: userFeedSubscriptionFromStorage.unsubscribedTime
      ? parseStorageTimestamp(userFeedSubscriptionFromStorage.unsubscribedTime)
      : undefined,
  });
}

function fromStorageYouTubeChannelUserFeedSubscription(
  userFeedSubscriptionFromStorage: YouTubeChannelUserFeedSubscriptionFromStorage
): Result<YouTubeChannelUserFeedSubscription, Error> {
  const parsedAccountIdResult = parseAccountId(userFeedSubscriptionFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    userFeedSubscriptionFromStorage.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(
    userFeedSubscriptionFromStorage.deliverySchedule
  );
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  const parsedChannelIdResult = parseYouTubeChannelId(userFeedSubscriptionFromStorage.channelId);
  if (!parsedChannelIdResult.success) return parsedChannelIdResult;

  return makeSuccessResult({
    feedSourceType: FeedSourceType.YouTubeChannel,
    channelId: parsedChannelIdResult.value,
    userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
    accountId: parsedAccountIdResult.value,
    isActive: userFeedSubscriptionFromStorage.isActive,
    deliverySchedule: parsedDeliveryScheduleResult.value,
    createdTime: parseStorageTimestamp(userFeedSubscriptionFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(userFeedSubscriptionFromStorage.lastUpdatedTime),
    unsubscribedTime: userFeedSubscriptionFromStorage.unsubscribedTime
      ? parseStorageTimestamp(userFeedSubscriptionFromStorage.unsubscribedTime)
      : undefined,
  });
}

function fromStorageIntervalUserFeedSubscription(
  userFeedSubscriptionFromStorage: IntervalUserFeedSubscriptionFromStorage
): Result<IntervalUserFeedSubscription, Error> {
  const parsedAccountIdResult = parseAccountId(userFeedSubscriptionFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    userFeedSubscriptionFromStorage.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(
    userFeedSubscriptionFromStorage.deliverySchedule
  );
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  return makeSuccessResult({
    feedSourceType: FeedSourceType.Interval,
    intervalSeconds: userFeedSubscriptionFromStorage.intervalSeconds,
    userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
    accountId: parsedAccountIdResult.value,
    isActive: userFeedSubscriptionFromStorage.isActive,
    deliverySchedule: parsedDeliveryScheduleResult.value,
    createdTime: parseStorageTimestamp(userFeedSubscriptionFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(userFeedSubscriptionFromStorage.lastUpdatedTime),
    unsubscribedTime: userFeedSubscriptionFromStorage.unsubscribedTime
      ? parseStorageTimestamp(userFeedSubscriptionFromStorage.unsubscribedTime)
      : undefined,
  });
}
