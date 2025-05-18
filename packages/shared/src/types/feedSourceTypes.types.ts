/**
 * Note: This file exists to avoid circular dependencies between `feedSources.types.ts` and
 * `userFeedSubscriptions.types.ts`. Alternatively, we could consider introducing a new
 * `FeedSubscriptionType` that is a mirror of `FeedSourceType` but used on `UserFeedSubscription`.
 */

/**
 * The origin of the feed item. Where the feed item came from.
 */
export enum FeedSourceType {
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
 * List of {@link FeedSourceType} that have additional state persisted along with the type.
 */
export const PERSISTED_FEED_SOURCE_TYPES = [
  FeedSourceType.RSS,
  FeedSourceType.YouTubeChannel,
  FeedSourceType.Interval,
] as const;

/**
 * Subset of {@link FeedSourceType} that have additional state persisted along with the type.
 */
export type PersistedFeedSourceType = (typeof PERSISTED_FEED_SOURCE_TYPES)[number];
