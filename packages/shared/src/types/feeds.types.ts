import type {FeedType} from '@shared/types/feedSourceTypes.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

interface BaseFeed {
  readonly feedType: FeedType;
}

export interface RssFeed extends BaseFeed {
  readonly feedType: FeedType.RSS;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export interface YouTubeChannelFeed extends BaseFeed {
  readonly feedType: FeedType.YouTubeChannel;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export interface IntervalFeed extends BaseFeed {
  readonly feedType: FeedType.Interval;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
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
