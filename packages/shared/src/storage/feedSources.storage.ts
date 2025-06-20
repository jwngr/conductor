import {
  EXTENSION_FEED_SOURCE,
  POCKET_EXPORT_FEED_SOURCE,
  PWA_FEED_SOURCE,
} from '@shared/lib/feedSources.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';

import type {
  FeedSource,
  IntervalFeedSource,
  RssFeedSource,
  YouTubeChannelFeedSource,
} from '@shared/types/feedSources.types';
import {FeedType} from '@shared/types/feedSourceTypes.types';
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
    case FeedType.RSS:
      return toStorageRssFeedSource(feedSource);
    case FeedType.YouTubeChannel:
      return toStorageYouTubeChannelFeedSource(feedSource);
    case FeedType.Interval:
      return toStorageIntervalFeedSource(feedSource);
    case FeedType.Extension:
      return EXTENSION_FEED_SOURCE;
    case FeedType.PocketExport:
      return POCKET_EXPORT_FEED_SOURCE;
    case FeedType.PWA:
      return PWA_FEED_SOURCE;
    default:
      assertNever(feedSource);
  }
}

function toStorageRssFeedSource(feedSource: RssFeedSource): RssFeedSourceFromStorage {
  return {
    feedSourceType: FeedType.RSS,
    userFeedSubscriptionId: feedSource.userFeedSubscriptionId,
  };
}

function toStorageYouTubeChannelFeedSource(
  feedSource: YouTubeChannelFeedSource
): YouTubeChannelFeedSourceFromStorage {
  return {
    feedSourceType: FeedType.YouTubeChannel,
    userFeedSubscriptionId: feedSource.userFeedSubscriptionId,
  };
}

function toStorageIntervalFeedSource(
  feedSource: IntervalFeedSource
): IntervalFeedSourceFromStorage {
  return {
    feedSourceType: FeedType.Interval,
    userFeedSubscriptionId: feedSource.userFeedSubscriptionId,
  };
}

/**
 * Converts a {@link FeedSourceFromStorage} into a {@link FeedSource}.
 */
export function fromStorageFeedSource(
  feedSourceFromStorage: FeedSourceFromStorage
): Result<FeedSource, Error> {
  switch (feedSourceFromStorage.feedSourceType) {
    case FeedType.RSS:
      return fromStorageRssFeedSource(feedSourceFromStorage);
    case FeedType.YouTubeChannel:
      return fromStorageYouTubeChannelFeedSource(feedSourceFromStorage);
    case FeedType.Interval:
      return fromStorageIntervalFeedSource(feedSourceFromStorage);
    case FeedType.Extension:
      return makeSuccessResult(EXTENSION_FEED_SOURCE);
    case FeedType.PocketExport:
      return makeSuccessResult(POCKET_EXPORT_FEED_SOURCE);
    case FeedType.PWA:
      return makeSuccessResult(PWA_FEED_SOURCE);
    default:
      assertNever(feedSourceFromStorage);
  }
}

function fromStorageRssFeedSource(
  feedSourceFromStorage: RssFeedSourceFromStorage
): Result<RssFeedSource, Error> {
  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    feedSourceFromStorage.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  return makeSuccessResult({
    feedSourceType: FeedType.RSS,
    userFeedSubscriptionId: parsedFeedSubIdResult.value,
  });
}

function fromStorageYouTubeChannelFeedSource(
  feedSourceFromStorage: YouTubeChannelFeedSourceFromStorage
): Result<YouTubeChannelFeedSource, Error> {
  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    feedSourceFromStorage.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  return makeSuccessResult({
    feedSourceType: FeedType.YouTubeChannel,
    userFeedSubscriptionId: parsedFeedSubIdResult.value,
  });
}

function fromStorageIntervalFeedSource(
  feedSourceFromStorage: IntervalFeedSourceFromStorage
): Result<IntervalFeedSource, Error> {
  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    feedSourceFromStorage.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  return makeSuccessResult({
    feedSourceType: FeedType.Interval,
    userFeedSubscriptionId: parsedFeedSubIdResult.value,
  });
}
