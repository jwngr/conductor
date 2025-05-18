import {makeUuid} from '@shared/lib/utils.shared';
import {isXkcdComicUrl} from '@shared/lib/xkcd.shared';
import {isYouTubeChannelUrl} from '@shared/lib/youtube.shared';

import type {
  FeedSourceId,
  IntervalFeedSource,
  RssFeedSource,
  RssMiniFeedSource,
  YouTubeChannelFeedSource,
} from '@shared/types/feedSources.types';
import {FeedSourceType} from '@shared/types/feedSources.types';

export function makeFeedSourceId(): FeedSourceId {
  return makeUuid<FeedSourceId>();
}

export function makeRssFeedSource(
  args: Omit<RssFeedSource, 'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
): RssFeedSource {
  const {url, title} = args;

  return {
    type: FeedSourceType.RSS,
    feedSourceId: makeFeedSourceId(),
    url,
    title,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeYouTubeFeedSource(
  args: Omit<YouTubeChannelFeedSource, 'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
): YouTubeChannelFeedSource {
  const {channelId} = args;

  return {
    type: FeedSourceType.YouTubeChannel,
    feedSourceId: makeFeedSourceId(),
    channelId,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeIntervalFeedSource(
  args: Omit<IntervalFeedSource, 'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
): IntervalFeedSource {
  const {intervalSeconds} = args;

  return {
    type: FeedSourceType.Interval,
    feedSourceId: makeFeedSourceId(),
    intervalSeconds,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

/**
 * This is used to determine which {@link FeedSourceType} to use when creating a new feed source.
 *
 * Note: The return type is limited - this method assumes the feed source is persisted and ignores
 * in-memory feed sources.
 */
export function getPersistedFeedSourceTypeFromUrl(
  url: string
): FeedSourceType.YouTubeChannel | FeedSourceType.RSS {
  if (isYouTubeChannelUrl(url)) {
    return FeedSourceType.YouTubeChannel;
  } else if (isXkcdComicUrl(url)) {
    // TODO: Consider adding explicit XKCD feed source type.
    return FeedSourceType.RSS;
  }

  // Default to RSS.
  return FeedSourceType.RSS;
}
