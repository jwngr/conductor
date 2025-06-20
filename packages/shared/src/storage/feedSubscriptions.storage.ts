import {parseStorageTimestamp} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseDeliverySchedule} from '@shared/parsers/deliverySchedules.parser';
import {parseFeedSubscriptionId} from '@shared/parsers/feedSubscriptions.parser';
import {parseYouTubeChannelId} from '@shared/parsers/youtube.parser';

import {FeedType} from '@shared/types/feedSourceTypes.types';
import type {
  FeedSubscription,
  IntervalFeedSubscription,
  RssFeedSubscription,
  YouTubeChannelFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import type {Result} from '@shared/types/results.types';

import type {
  FeedSubscriptionFromStorage,
  IntervalFeedSubscriptionFromStorage,
  RssFeedSubscriptionFromStorage,
  YouTubeChannelFeedSubscriptionFromStorage,
} from '@shared/schemas/feedSubscriptions.schema';
import {toStorageDeliverySchedule} from '@shared/storage/deliverySchedules.storage';

/**
 * Converts a {@link FeedSubscription} into a {@link FeedSubscriptionFromStorage}.
 */
export function toStorageFeedSubscription(
  feedSubscription: FeedSubscription
): FeedSubscriptionFromStorage {
  switch (feedSubscription.feedType) {
    case FeedType.RSS:
      return {
        feedType: FeedType.RSS,
        feedSubscriptionId: feedSubscription.feedSubscriptionId,
        url: feedSubscription.url,
        title: feedSubscription.title,
        accountId: feedSubscription.accountId,
        isActive: feedSubscription.isActive,
        unsubscribedTime: feedSubscription.unsubscribedTime,
        createdTime: feedSubscription.createdTime,
        lastUpdatedTime: feedSubscription.lastUpdatedTime,
        deliverySchedule: toStorageDeliverySchedule(feedSubscription.deliverySchedule),
      };
    case FeedType.YouTubeChannel:
      return {
        feedType: FeedType.YouTubeChannel,
        feedSubscriptionId: feedSubscription.feedSubscriptionId,
        channelId: feedSubscription.channelId,
        accountId: feedSubscription.accountId,
        isActive: feedSubscription.isActive,
        unsubscribedTime: feedSubscription.unsubscribedTime,
        createdTime: feedSubscription.createdTime,
        lastUpdatedTime: feedSubscription.lastUpdatedTime,
        deliverySchedule: toStorageDeliverySchedule(feedSubscription.deliverySchedule),
      };
    case FeedType.Interval:
      return {
        feedType: FeedType.Interval,
        intervalSeconds: feedSubscription.intervalSeconds,
        feedSubscriptionId: feedSubscription.feedSubscriptionId,
        accountId: feedSubscription.accountId,
        isActive: feedSubscription.isActive,
        unsubscribedTime: feedSubscription.unsubscribedTime,
        createdTime: feedSubscription.createdTime,
        lastUpdatedTime: feedSubscription.lastUpdatedTime,
        deliverySchedule: toStorageDeliverySchedule(feedSubscription.deliverySchedule),
      };
    default:
      assertNever(feedSubscription);
  }
}

/**
 * Converts a {@link FeedSubscriptionFromStorage} into a {@link FeedSubscription}.
 */
export function fromStorageFeedSubscription(
  feedSubscriptionFromStorage: FeedSubscriptionFromStorage
): Result<FeedSubscription, Error> {
  switch (feedSubscriptionFromStorage.feedType) {
    case FeedType.RSS:
      return fromStorageRssFeedSubscription(feedSubscriptionFromStorage);
    case FeedType.YouTubeChannel:
      return fromStorageYouTubeChannelFeedSubscription(feedSubscriptionFromStorage);
    case FeedType.Interval:
      return fromStorageIntervalFeedSubscription(feedSubscriptionFromStorage);
    default:
      assertNever(feedSubscriptionFromStorage);
  }
}

function fromStorageRssFeedSubscription(
  feedSubscriptionFromStorage: RssFeedSubscriptionFromStorage
): Result<RssFeedSubscription, Error> {
  const parsedAccountIdResult = parseAccountId(feedSubscriptionFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedFeedSubscriptionIdResult = parseFeedSubscriptionId(
    feedSubscriptionFromStorage.feedSubscriptionId
  );
  if (!parsedFeedSubscriptionIdResult.success) return parsedFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(
    feedSubscriptionFromStorage.deliverySchedule
  );
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  return makeSuccessResult({
    feedType: FeedType.RSS,
    url: feedSubscriptionFromStorage.url,
    title: feedSubscriptionFromStorage.title,
    feedSubscriptionId: parsedFeedSubscriptionIdResult.value,
    accountId: parsedAccountIdResult.value,
    isActive: feedSubscriptionFromStorage.isActive,
    deliverySchedule: parsedDeliveryScheduleResult.value,
    createdTime: parseStorageTimestamp(feedSubscriptionFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedSubscriptionFromStorage.lastUpdatedTime),
    unsubscribedTime: feedSubscriptionFromStorage.unsubscribedTime
      ? parseStorageTimestamp(feedSubscriptionFromStorage.unsubscribedTime)
      : undefined,
  });
}

function fromStorageYouTubeChannelFeedSubscription(
  feedSubscriptionFromStorage: YouTubeChannelFeedSubscriptionFromStorage
): Result<YouTubeChannelFeedSubscription, Error> {
  const parsedAccountIdResult = parseAccountId(feedSubscriptionFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedFeedSubscriptionIdResult = parseFeedSubscriptionId(
    feedSubscriptionFromStorage.feedSubscriptionId
  );
  if (!parsedFeedSubscriptionIdResult.success) return parsedFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(
    feedSubscriptionFromStorage.deliverySchedule
  );
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  const parsedChannelIdResult = parseYouTubeChannelId(feedSubscriptionFromStorage.channelId);
  if (!parsedChannelIdResult.success) return parsedChannelIdResult;

  return makeSuccessResult({
    feedType: FeedType.YouTubeChannel,
    channelId: parsedChannelIdResult.value,
    feedSubscriptionId: parsedFeedSubscriptionIdResult.value,
    accountId: parsedAccountIdResult.value,
    isActive: feedSubscriptionFromStorage.isActive,
    deliverySchedule: parsedDeliveryScheduleResult.value,
    createdTime: parseStorageTimestamp(feedSubscriptionFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedSubscriptionFromStorage.lastUpdatedTime),
    unsubscribedTime: feedSubscriptionFromStorage.unsubscribedTime
      ? parseStorageTimestamp(feedSubscriptionFromStorage.unsubscribedTime)
      : undefined,
  });
}

function fromStorageIntervalFeedSubscription(
  feedSubscriptionFromStorage: IntervalFeedSubscriptionFromStorage
): Result<IntervalFeedSubscription, Error> {
  const parsedAccountIdResult = parseAccountId(feedSubscriptionFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedFeedSubscriptionIdResult = parseFeedSubscriptionId(
    feedSubscriptionFromStorage.feedSubscriptionId
  );
  if (!parsedFeedSubscriptionIdResult.success) return parsedFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(
    feedSubscriptionFromStorage.deliverySchedule
  );
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  return makeSuccessResult({
    feedType: FeedType.Interval,
    intervalSeconds: feedSubscriptionFromStorage.intervalSeconds,
    feedSubscriptionId: parsedFeedSubscriptionIdResult.value,
    accountId: parsedAccountIdResult.value,
    isActive: feedSubscriptionFromStorage.isActive,
    deliverySchedule: parsedDeliveryScheduleResult.value,
    createdTime: parseStorageTimestamp(feedSubscriptionFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedSubscriptionFromStorage.lastUpdatedTime),
    unsubscribedTime: feedSubscriptionFromStorage.unsubscribedTime
      ? parseStorageTimestamp(feedSubscriptionFromStorage.unsubscribedTime)
      : undefined,
  });
}
