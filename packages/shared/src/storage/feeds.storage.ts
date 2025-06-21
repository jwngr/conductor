import {EXTENSION_FEED, POCKET_EXPORT_FEED, PWA_FEED} from '@shared/lib/feeds.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseFeedSubscriptionId} from '@shared/parsers/feedSubscriptions.parser';

import type {Feed, IntervalFeed, RssFeed, YouTubeChannelFeed} from '@shared/types/feeds.types';
import {FeedType} from '@shared/types/feedTypes.types';
import type {Result} from '@shared/types/results.types';

import type {
  FeedFromStorage,
  IntervalFeedFromStorage,
  RssFeedFromStorage,
  YouTubeChannelFeedFromStorage,
} from '@shared/schemas/feeds.schema';

/**
 * Converts a {@link Feed} into a {@link FeedFromStorage}.
 */
export function toStorageFeed(feed: Feed): FeedFromStorage {
  switch (feed.feedType) {
    case FeedType.RSS:
      return toStorageRssFeed(feed);
    case FeedType.YouTubeChannel:
      return toStorageYouTubeChannelFeed(feed);
    case FeedType.Interval:
      return toStorageIntervalFeed(feed);
    case FeedType.Extension:
      return EXTENSION_FEED;
    case FeedType.PocketExport:
      return POCKET_EXPORT_FEED;
    case FeedType.PWA:
      return PWA_FEED;
    default:
      assertNever(feed);
  }
}

function toStorageRssFeed(feed: RssFeed): RssFeedFromStorage {
  return {
    feedType: FeedType.RSS,
    feedSubscriptionId: feed.feedSubscriptionId,
  };
}

function toStorageYouTubeChannelFeed(feed: YouTubeChannelFeed): YouTubeChannelFeedFromStorage {
  return {
    feedType: FeedType.YouTubeChannel,
    feedSubscriptionId: feed.feedSubscriptionId,
  };
}

function toStorageIntervalFeed(feed: IntervalFeed): IntervalFeedFromStorage {
  return {
    feedType: FeedType.Interval,
    feedSubscriptionId: feed.feedSubscriptionId,
  };
}

/**
 * Converts a {@link FeedFromStorage} into a {@link Feed}.
 */
export function fromStorageFeed(feedFromStorage: FeedFromStorage): Result<Feed, Error> {
  switch (feedFromStorage.feedType) {
    case FeedType.RSS:
      return fromStorageRssFeed(feedFromStorage);
    case FeedType.YouTubeChannel:
      return fromStorageYouTubeChannelFeed(feedFromStorage);
    case FeedType.Interval:
      return fromStorageIntervalFeed(feedFromStorage);
    case FeedType.Extension:
      return makeSuccessResult(EXTENSION_FEED);
    case FeedType.PocketExport:
      return makeSuccessResult(POCKET_EXPORT_FEED);
    case FeedType.PWA:
      return makeSuccessResult(PWA_FEED);
    default:
      assertNever(feedFromStorage);
  }
}

function fromStorageRssFeed(feedFromStorage: RssFeedFromStorage): Result<RssFeed, Error> {
  const parsedFeedSubIdResult = parseFeedSubscriptionId(feedFromStorage.feedSubscriptionId);
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  return makeSuccessResult({
    feedType: FeedType.RSS,
    feedSubscriptionId: parsedFeedSubIdResult.value,
  });
}

function fromStorageYouTubeChannelFeed(
  feedFromStorage: YouTubeChannelFeedFromStorage
): Result<YouTubeChannelFeed, Error> {
  const parsedFeedSubIdResult = parseFeedSubscriptionId(feedFromStorage.feedSubscriptionId);
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  return makeSuccessResult({
    feedType: FeedType.YouTubeChannel,
    feedSubscriptionId: parsedFeedSubIdResult.value,
  });
}

function fromStorageIntervalFeed(
  feedFromStorage: IntervalFeedFromStorage
): Result<IntervalFeed, Error> {
  const parsedFeedSubIdResult = parseFeedSubscriptionId(feedFromStorage.feedSubscriptionId);
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  return makeSuccessResult({
    feedType: FeedType.Interval,
    feedSubscriptionId: parsedFeedSubIdResult.value,
  });
}
