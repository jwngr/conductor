import type {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

interface BaseFeedSource {
  readonly feedSourceType: FeedSourceType;
}

export interface RssFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.RSS;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export interface YouTubeChannelFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.YouTubeChannel;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export interface IntervalFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.Interval;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export interface PwaFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.PWA;
}

export interface ExtensionFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.Extension;
}

export interface PocketExportFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.PocketExport;
}

export type FeedSource =
  | RssFeedSource
  | YouTubeChannelFeedSource
  | PwaFeedSource
  | ExtensionFeedSource
  | PocketExportFeedSource
  | IntervalFeedSource;
