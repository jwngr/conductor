import {
  EXTENSION_FEED_SOURCE,
  POCKET_EXPORT_FEED_SOURCE,
  PWA_FEED_SOURCE,
} from '@shared/lib/feedSources.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';
import {parseYouTubeChannelId} from '@shared/parsers/youtube.parser';

import type {
  FeedSource,
  IntervalFeedSource,
  RssFeedSource,
  YouTubeChannelFeedSource,
} from '@shared/types/feedSources.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {Result} from '@shared/types/results.types';

import type {
  FeedSourceFromStorage,
  IntervalFeedSourceFromStorage,
  RssFeedSourceFromStorage,
  YouTubeChannelFeedSourceFromStorage,
} from '@shared/schemas/feedSources.schema';

/**
 * Converts a {@link FeedSource} into a {@link FeedSourceFromStorage}.
 */
export function toStorageFeedSource(feedSource: FeedSource): FeedSourceFromStorage {
  switch (feedSource.feedSourceType) {
    case FeedSourceType.RSS:
      return {
        feedSourceType: FeedSourceType.RSS,
        userFeedSubscriptionId: feedSource.userFeedSubscriptionId,
        url: feedSource.url,
        title: feedSource.title,
      };
    case FeedSourceType.YouTubeChannel:
      return {
        feedSourceType: FeedSourceType.YouTubeChannel,
        userFeedSubscriptionId: feedSource.userFeedSubscriptionId,
        channelId: feedSource.channelId,
      };
    case FeedSourceType.Interval:
      return {
        feedSourceType: FeedSourceType.Interval,
        userFeedSubscriptionId: feedSource.userFeedSubscriptionId,
      };
    case FeedSourceType.Extension:
      return EXTENSION_FEED_SOURCE;
    case FeedSourceType.PocketExport:
      return POCKET_EXPORT_FEED_SOURCE;
    case FeedSourceType.PWA:
      return PWA_FEED_SOURCE;
    default:
      assertNever(feedSource);
  }
}

/**
 * Converts a {@link FeedSourceFromStorage} into a {@link FeedSource}.
 */
export function fromStorageFeedSource(
  feedSourceFromStorage: FeedSourceFromStorage
): Result<FeedSource> {
  switch (feedSourceFromStorage.feedSourceType) {
    case FeedSourceType.RSS:
      return fromStorageRssFeedSource(feedSourceFromStorage);
    case FeedSourceType.YouTubeChannel:
      return fromStorageYouTubeChannelFeedSource(feedSourceFromStorage);
    case FeedSourceType.Interval:
      return fromStorageIntervalFeedSource(feedSourceFromStorage);
    case FeedSourceType.Extension:
      return makeSuccessResult(EXTENSION_FEED_SOURCE);
    case FeedSourceType.PocketExport:
      return makeSuccessResult(POCKET_EXPORT_FEED_SOURCE);
    case FeedSourceType.PWA:
      return makeSuccessResult(PWA_FEED_SOURCE);
    default:
      assertNever(feedSourceFromStorage);
  }
}

export function fromStorageRssFeedSource(
  feedSourceFromStorage: RssFeedSourceFromStorage
): Result<RssFeedSource> {
  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    feedSourceFromStorage.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  return makeSuccessResult({
    feedSourceType: FeedSourceType.RSS,
    userFeedSubscriptionId: parsedFeedSubIdResult.value,
    url: feedSourceFromStorage.url,
    title: feedSourceFromStorage.title,
  });
}

export function fromStorageYouTubeChannelFeedSource(
  feedSourceFromStorage: YouTubeChannelFeedSourceFromStorage
): Result<YouTubeChannelFeedSource> {
  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    feedSourceFromStorage.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  const parsedChannelIdResult = parseYouTubeChannelId(feedSourceFromStorage.channelId);
  if (!parsedChannelIdResult.success) return parsedChannelIdResult;

  return makeSuccessResult({
    feedSourceType: FeedSourceType.YouTubeChannel,
    userFeedSubscriptionId: parsedFeedSubIdResult.value,
    channelId: parsedChannelIdResult.value,
  });
}

export function fromStorageIntervalFeedSource(
  feedSourceFromStorage: IntervalFeedSourceFromStorage
): Result<IntervalFeedSource> {
  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    feedSourceFromStorage.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  return makeSuccessResult({
    feedSourceType: FeedSourceType.Interval,
    userFeedSubscriptionId: parsedFeedSubIdResult.value,
  });
}
