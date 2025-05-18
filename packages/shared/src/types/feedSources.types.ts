import {z} from 'zod';

import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {BaseStoreItem} from '@shared/types/utils.types';
import type {YouTubeChannelId} from '@shared/types/youtube.types';
import {YouTubeChannelIdSchema} from '@shared/types/youtube.types';

/**
 * Strongly-typed type for a {@link PersistedFeedSource}'s unique identifier. Prefer this over plain strings.
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
  /** Feeds that are added from the PWA. */
  PWA = 'PWA',
  /** Feeds that are added from the web extension. */
  Extension = 'EXTENSION',
  /** Feeds that are added from a Pocket export. */
  PocketExport = 'POCKET_EXPORT',
}

interface BaseInMemoryFeedSource {
  readonly type: FeedSourceType;
}

interface BasePersistedFeedSource extends BaseStoreItem {
  readonly type: FeedSourceType;
}

export interface PWAFeedSource extends BaseInMemoryFeedSource {
  readonly type: FeedSourceType.PWA;
}

export const PWA_FEED_SOURCE: PWAFeedSource = {
  type: FeedSourceType.PWA,
};

export interface ExtensionFeedSource extends BaseInMemoryFeedSource {
  readonly type: FeedSourceType.Extension;
}

export const EXTENSION_FEED_SOURCE: ExtensionFeedSource = {
  type: FeedSourceType.Extension,
};

export interface PocketExportFeedSource extends BaseInMemoryFeedSource {
  readonly type: FeedSourceType.PocketExport;
}

export const POCKET_EXPORT_FEED_SOURCE: PocketExportFeedSource = {
  type: FeedSourceType.PocketExport,
};

export interface RssFeedSource extends BasePersistedFeedSource {
  readonly type: FeedSourceType.RSS;
  readonly feedSourceId: FeedSourceId;
  readonly url: string;
  readonly title: string;
}

export interface YouTubeChannelFeedSource extends BasePersistedFeedSource {
  readonly type: FeedSourceType.YouTubeChannel;
  readonly feedSourceId: FeedSourceId;
  readonly channelId: YouTubeChannelId;
}

export interface IntervalFeedSource extends BasePersistedFeedSource {
  readonly type: FeedSourceType.Interval;
  readonly feedSourceId: FeedSourceId;
  /** Interval, in seconds, at which the dummy feed source will generate items. */
  readonly intervalSeconds: number;
}

/**
 * A generator of {@link FeedItem}s over time.
 *
 * Use the {@link UserFeedSubscription} object to manage user subscriptions to a {@link PersistedFeedSource}.
 * A feed source is created the first time an account subscribes to a unique feed URL.
 */
export type PersistedFeedSource =
  | PWAFeedSource
  | ExtensionFeedSource
  | PocketExportFeedSource
  | RssFeedSource
  | YouTubeChannelFeedSource
  | IntervalFeedSource;

/**
 * A subset of {@link PersistedFeedSource} with state which must be persisted to Firestore. Unlike in-memory
 * feed sources, a persisted feed source has a unique ID and helpers for parsing and storage.
 */
export type PersistedFeedSource = Exclude<
  PersistedFeedSource,
  // These feed sources are constants which do not need to be persisted to Firestore beyond an ID.
  PWAFeedSource | ExtensionFeedSource | PocketExportFeedSource
>;

type MiniRssFeedSource = Pick<RssFeedSource, 'type' | 'feedSourceId' | 'url' | 'title'>;
type MiniYouTubeChannelFeedSource = Pick<
  YouTubeChannelFeedSource,
  'type' | 'feedSourceId' | 'channelId'
>;
type MiniIntervalFeedSource = Pick<IntervalFeedSource, 'type' | 'feedSourceId'>;

export type MiniFeedSource =
  | PWAFeedSource
  | ExtensionFeedSource
  | PocketExportFeedSource
  | MiniRssFeedSource
  | MiniYouTubeChannelFeedSource
  | MiniIntervalFeedSource;

const BaseInMemoryFeedSourceSchema = z.object({
  type: z.nativeEnum(FeedSourceType),
});

const BasePersistedFeedSourceSchema = z.object({
  type: z.nativeEnum(FeedSourceType),
  feedSourceId: FeedSourceIdSchema,
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

export const RssFeedSourceSchema = BasePersistedFeedSourceSchema.extend({
  type: z.literal(FeedSourceType.RSS),
  url: z.string().url(),
  title: z.string(),
});

export const YouTubeChannelFeedSourceSchema = BasePersistedFeedSourceSchema.extend({
  type: z.literal(FeedSourceType.YouTubeChannel),
  channelId: YouTubeChannelIdSchema,
});

export const IntervalFeedSourceSchema = BasePersistedFeedSourceSchema.extend({
  type: z.literal(FeedSourceType.Interval),
  intervalSeconds: z.number().min(1),
});

export const PWAFeedSourceSchema = BaseInMemoryFeedSourceSchema.extend({
  type: z.literal(FeedSourceType.PWA),
});

export const ExtensionFeedSourceSchema = BaseInMemoryFeedSourceSchema.extend({
  type: z.literal(FeedSourceType.Extension),
});

export const PocketExportFeedSourceSchema = BaseInMemoryFeedSourceSchema.extend({
  type: z.literal(FeedSourceType.PocketExport),
});

export type RssFeedSourceFromStorage = z.infer<typeof RssFeedSourceSchema>;
export type YouTubeChannelFeedSourceFromStorage = z.infer<typeof YouTubeChannelFeedSourceSchema>;
export type IntervalFeedSourceFromStorage = z.infer<typeof IntervalFeedSourceSchema>;
export type PWAFeedSourceFromStorage = z.infer<typeof PWAFeedSourceSchema>;
export type ExtensionFeedSourceFromStorage = z.infer<typeof ExtensionFeedSourceSchema>;
export type PocketExportFeedSourceFromStorage = z.infer<typeof PocketExportFeedSourceSchema>;

/**
 * Zod schema for a {@link PersistedFeedSource} persisted to Firestore.
 */
export const FeedSourceFromStorageSchema = z.union([
  RssFeedSourceSchema,
  YouTubeChannelFeedSourceSchema,
  IntervalFeedSourceSchema,
  PWAFeedSourceSchema,
  ExtensionFeedSourceSchema,
  PocketExportFeedSourceSchema,
]);

/**
 * Type for a {@link PersistedFeedSource} persisted to Firestore.
 */
export type FeedSourceFromStorage =
  | RssFeedSourceFromStorage
  | YouTubeChannelFeedSourceFromStorage
  | IntervalFeedSourceFromStorage
  | PWAFeedSourceFromStorage
  | ExtensionFeedSourceFromStorage
  | PocketExportFeedSourceFromStorage;
