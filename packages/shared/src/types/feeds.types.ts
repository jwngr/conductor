import type {FeedType} from '@shared/types/feedSourceTypes.types';
import type {FeedSubscriptionId} from '@shared/types/feedSubscriptions.types';

interface BaseFeed {
  readonly feedType: FeedType;
}

export interface RssFeed extends BaseFeed {
  readonly feedType: FeedType.RSS;
  readonly feedSubscriptionId: FeedSubscriptionId;
}

export interface YouTubeChannelFeed extends BaseFeed {
  readonly feedType: FeedType.YouTubeChannel;
  readonly feedSubscriptionId: FeedSubscriptionId;
}

export interface IntervalFeed extends BaseFeed {
  readonly feedType: FeedType.Interval;
  readonly feedSubscriptionId: FeedSubscriptionId;
}

export interface PwaFeed extends BaseFeed {
  readonly feedType: FeedType.PWA;
}

export interface ExtensionFeed extends BaseFeed {
  readonly feedType: FeedType.Extension;
}

export interface PocketExportFeed extends BaseFeed {
  readonly feedType: FeedType.PocketExport;
}

export type Feed =
  | RssFeed
  | YouTubeChannelFeed
  | PwaFeed
  | ExtensionFeed
  | PocketExportFeed
  | IntervalFeed;
