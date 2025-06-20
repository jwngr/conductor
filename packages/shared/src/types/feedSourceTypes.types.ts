/**
 * Note: This file exists to avoid circular dependencies between `feeds.types.ts` and
 * `feedSubscriptions.types.ts`. `Feed`s store a `FeedSubscriptionId` and `FeedSubscription`s store
 * a `FeedType`. Alternatively, we could consider moving IDs into a separate file to eliminate the
 * dependency from `feeds.types.ts`.
 */

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
