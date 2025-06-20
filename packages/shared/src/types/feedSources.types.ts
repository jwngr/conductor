import type {FeedType} from '@shared/types/feedSourceTypes.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

interface BaseFeedSource {
  readonly feedSourceType: FeedType;
}

export interface RssFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedType.RSS;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export interface YouTubeChannelFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedType.YouTubeChannel;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export interface IntervalFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedType.Interval;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export interface PwaFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedType.PWA;
}

export interface ExtensionFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedType.Extension;
}

export interface PocketExportFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedType.PocketExport;
}

export type FeedSource =
  | RssFeedSource
  | YouTubeChannelFeedSource
  | PwaFeedSource
  | ExtensionFeedSource
  | PocketExportFeedSource
  | IntervalFeedSource;
