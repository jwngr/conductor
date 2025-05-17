import {makeUuid} from '@shared/lib/utils.shared';

import type {
  FeedSource,
  FeedSourceId,
  IntervalFeedSource,
  RssFeedSource,
  YouTubeChannelFeedSource,
} from '@shared/types/feedSources.types';
import {FeedSourceType} from '@shared/types/feedSources.types';

export function makeFeedSourceId(): FeedSourceId {
  return makeUuid<FeedSourceId>();
}

export function makeRssFeedSource(
  newItemArgs: Omit<RssFeedSource, 'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
): FeedSource {
  return {
    type: FeedSourceType.RSS,
    feedSourceId: makeFeedSourceId(),
    url: newItemArgs.url,
    title: newItemArgs.title,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeYouTubeFeedSource(
  newItemArgs: Omit<
    YouTubeChannelFeedSource,
    'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'
  >
): FeedSource {
  return {
    type: FeedSourceType.YouTubeChannel,
    feedSourceId: makeFeedSourceId(),
    url: newItemArgs.url,
    title: newItemArgs.title,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeIntervalFeedSource(
  newItemArgs: Omit<IntervalFeedSource, 'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
): FeedSource {
  return {
    type: FeedSourceType.Interval,
    feedSourceId: makeFeedSourceId(),
    url: newItemArgs.url,
    title: newItemArgs.title,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
    intervalSeconds: newItemArgs.intervalSeconds,
  };
}
