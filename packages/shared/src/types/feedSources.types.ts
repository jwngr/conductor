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
  RSS = 'RSS',
  YouTube = 'YOUTUBE',
  Dummy = 'DUMMY',
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

export interface YouTubeFeedSource extends BaseFeedSource {
  readonly type: FeedSourceType.YouTube;
}

export interface DummyFeedSource extends BaseFeedSource {
  readonly type: FeedSourceType.Dummy;
  // The interval in seconds at which the dummy feed source will generate items.
  readonly intervalSeconds: number;
}

/**
 * A generator of {@link FeedItem}s over time.
 *
 * Use the {@link UserFeedSubscription} object to manage user subscriptions to a {@link FeedSource}.
 * A feed source is created the first time an account subscribes to a unique feed URL.
 */
export type FeedSource = RssFeedSource | YouTubeFeedSource | DummyFeedSource;

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

export const YouTubeFeedSourceSchema = BaseFeedSourceSchema.extend({
  type: z.literal(FeedSourceType.YouTube),
});

export const DummyFeedSourceSchema = BaseFeedSourceSchema.extend({
  type: z.literal(FeedSourceType.Dummy),
  intervalSeconds: z.number().min(1),
});

export type RssFeedSourceFromStorage = z.infer<typeof RssFeedSourceSchema>;
export type YouTubeFeedSourceFromStorage = z.infer<typeof YouTubeFeedSourceSchema>;
export type DummyFeedSourceFromStorage = z.infer<typeof DummyFeedSourceSchema>;

/**
 * Zod schema for a {@link FeedSource} persisted to Firestore.
 */
export const FeedSourceFromStorageSchema = z.union([
  RssFeedSourceSchema,
  YouTubeFeedSourceSchema,
  DummyFeedSourceSchema,
]);

/**
 * Type for a {@link FeedSource} persisted to Firestore.
 */
export type FeedSourceFromStorage =
  | RssFeedSourceFromStorage
  | YouTubeFeedSourceFromStorage
  | DummyFeedSourceFromStorage;
