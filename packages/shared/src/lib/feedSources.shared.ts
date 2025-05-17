import {makeUuid} from '@shared/lib/utils.shared';

import type {
  DummyFeedSource,
  FeedSource,
  FeedSourceId,
  RssFeedSource,
  YouTubeFeedSource,
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
  newItemArgs: Omit<YouTubeFeedSource, 'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
): FeedSource {
  return {
    type: FeedSourceType.YouTube,
    feedSourceId: makeFeedSourceId(),
    url: newItemArgs.url,
    title: newItemArgs.title,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeDummyFeedSource(
  newItemArgs: Omit<DummyFeedSource, 'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
): FeedSource {
  return {
    type: FeedSourceType.Dummy,
    feedSourceId: makeFeedSourceId(),
    url: newItemArgs.url,
    title: newItemArgs.title,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
    intervalSeconds: newItemArgs.intervalSeconds,
  };
}
