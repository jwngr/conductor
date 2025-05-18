import {z} from 'zod';

import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a {@link FeedSource}'s unique identifier. Prefer this over plain strings.
 */
export type FeedSourceId = string & {readonly __brand: 'FeedSourceIdBrand'};

/**
 * Zod schema for a {@link FeedSourceId}.
 */
export const FeedSourceIdSchema = z.string().uuid();

export enum FeedSourceType {
  /** RSS feeds. */
  RSS = 'RSS',
  /** YouTube channels. */
  YouTubeChannel = 'YOUTUBE_CHANNEL',
  /** Dummy feeds that automatically generate items at a fixed interval. */
  Interval = 'INTERVAL',
}

interface BaseFeedSource extends BaseStoreItem {
  readonly type: FeedSourceType;
  readonly feedSourceId: FeedSourceId;
  readonly url: string;
  readonly title: string;
}

export interface RssFeedSource extends BaseFeedSource {
  readonly type: FeedSourceType.RSS;
}

export interface YouTubeChannelFeedSource extends BaseFeedSource {
  readonly type: FeedSourceType.YouTubeChannel;
}

export interface IntervalFeedSource extends BaseFeedSource {
  readonly type: FeedSourceType.Interval;
  // The interval in seconds at which the dummy feed source will generate items.
  readonly intervalSeconds: number;
}

/**
 * A generator of {@link FeedItem}s over time.
 *
 * Use the {@link UserFeedSubscription} object to manage user subscriptions to a {@link FeedSource}.
 * A feed source is created the first time an account subscribes to a unique feed URL.
 */
export type FeedSource = RssFeedSource | YouTubeChannelFeedSource | IntervalFeedSource;

const BaseFeedSourceSchema = z.object({
  type: z.nativeEnum(FeedSourceType),
  feedSourceId: FeedSourceIdSchema,
  url: z.string().url(),
  title: z.string(),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

export const RssFeedSourceSchema = BaseFeedSourceSchema.extend({
  type: z.literal(FeedSourceType.RSS),
});

export const YouTubeChannelFeedSourceSchema = BaseFeedSourceSchema.extend({
  type: z.literal(FeedSourceType.YouTubeChannel),
});

export const IntervalFeedSourceSchema = BaseFeedSourceSchema.extend({
  type: z.literal(FeedSourceType.Interval),
  intervalSeconds: z.number().min(1),
});

export type RssFeedSourceFromStorage = z.infer<typeof RssFeedSourceSchema>;
export type YouTubeChannelFeedSourceFromStorage = z.infer<typeof YouTubeChannelFeedSourceSchema>;
export type IntervalFeedSourceFromStorage = z.infer<typeof IntervalFeedSourceSchema>;

/**
 * Zod schema for a {@link FeedSource} persisted to Firestore.
 */
export const FeedSourceFromStorageSchema = z.union([
  RssFeedSourceSchema,
  YouTubeChannelFeedSourceSchema,
  IntervalFeedSourceSchema,
]);

/**
 * Type for a {@link FeedSource} persisted to Firestore.
 */
export type FeedSourceFromStorage =
  | RssFeedSourceFromStorage
  | YouTubeChannelFeedSourceFromStorage
  | IntervalFeedSourceFromStorage;
