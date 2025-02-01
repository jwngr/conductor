import {z} from 'zod';

import {makeUuid} from '@shared/lib/utils.shared';

import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {BaseStoreItem, Supplier} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a {@link FeedSource}'s unique identifier. Prefer this over plain strings.
 */
export type FeedSourceId = string & {readonly __brand: 'FeedSourceIdBrand'};

/**
 * Zod schema for a {@link FeedSourceId}.
 */
export const FeedSourceIdSchema = z.string().uuid();

/**
 * Creates a new random {@link FeedSourceId}.
 */
export function makeFeedSourceId(): FeedSourceId {
  return makeUuid<FeedSourceId>();
}

/**
 * A generator of {@link FeedItem}s over time.
 *
 * Use the {@link UserFeedSubscription} object to manage user subscriptions to a {@link FeedSource}.
 * A feed source is created the first time an account subscribes to a unique feed URL.
 */
export interface FeedSource extends BaseStoreItem {
  readonly feedSourceId: FeedSourceId;
  readonly url: string;
  readonly title: string;
}

/**
 * Zod schema for a {@link FeedSource} persisted to Firestore.
 */
export const FeedSourceFromStorageSchema = z.object({
  feedSourceId: FeedSourceIdSchema,
  url: z.string().url(),
  title: z.string().min(1),
  createdTime: FirestoreTimestampSchema,
  lastUpdatedTime: FirestoreTimestampSchema,
});

/**
 * Type for a {@link FeedSource} persisted to Firestore.
 */
export type FeedSourceFromStorage = z.infer<typeof FeedSourceFromStorageSchema>;

/**
 * Creates a new {@link FeedSource} object.
 */
export function makeFeedSource<Timestamp>(
  newItemArgs: Omit<FeedSource, 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>,
  timestampFactory: Supplier<Timestamp>
): Result<FeedSource> {
  const feedSource: FeedSource = {
    feedSourceId: makeFeedSourceId(),
    url: newItemArgs.url,
    title: newItemArgs.title,
    // TODO: This casting is a lie. Can I figure out a way to make this work without casting?
    createdTime: timestampFactory() as Date,
    lastUpdatedTime: timestampFactory() as Date,
  };

  return makeSuccessResult(feedSource);
}
