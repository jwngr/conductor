import type {FeedSubscriptionId} from '@shared/types/ids.types';

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

/**
 * The origin of the feed item. Where the feed item came from.
 */
export enum FeedType {
  /** RSS feeds. */
  RSS = 'RSS',
  /** YouTube channels. */
  YouTubeChannel = 'YOUTUBE_CHANNEL',
  /** Dummy feeds that automatically generate items at a fixed interval. */
  Interval = 'INTERVAL',
  /** Feeds that are added from the PWA. */
  PWA = 'PWA',
  /** Feeds that are added from the web extension. */
  Extension = 'EXTENSION',
  /** Feeds that are added from a Pocket export. */
  PocketExport = 'POCKET_EXPORT',
}

/**
 * List of {@link FeedType} that have a {@link FeedSubscription} associated with them.
 */
export const FEED_TYPES_WITH_SUBSCRIPTIONS = [
  FeedType.RSS,
  FeedType.YouTubeChannel,
  FeedType.Interval,
] as const;

/**
 * Subset of {@link FeedType} that have a {@link FeedSubscription} associated with them.
 */
export type FeedTypeWithSubscription = (typeof FEED_TYPES_WITH_SUBSCRIPTIONS)[number];
