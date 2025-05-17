import {makeUuid} from '@shared/lib/utils.shared';

import {FeedSourceType, type FeedSource, type FeedSourceId} from '@shared/types/feedSources.types';

export function makeFeedSourceId(): FeedSourceId {
  return makeUuid<FeedSourceId>();
}

export function makeRssFeedSource(
  newItemArgs: Omit<FeedSource, 'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
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
  newItemArgs: Omit<FeedSource, 'type' | 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
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
