import {z} from 'zod';

import {makeUuid} from '@shared/lib/utils.shared';

import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

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
 * A feed source is created the first time a user subscribes to a unique feed URL.
 */
export interface FeedSource extends BaseStoreItem {
  readonly feedSourceId: FeedSourceId;
  readonly url: string;
  readonly title: string;
}

/**
 * Zod schema for a {@link FeedSource}.
 */
export const FeedSourceSchema = z.object({
  feedSourceId: FeedSourceIdSchema,
  url: z.string().url(),
  title: z.string().min(1),
  createdTime: z.date(),
  lastUpdatedTime: z.date(),
});

/**
 * Creates a new {@link FeedSource} object.
 */
export function makeFeedSource(args: Omit<FeedSource, 'feedSourceId'>): Result<FeedSource> {
  const feedSource: FeedSource = {
    feedSourceId: makeFeedSourceId(),
    url: args.url,
    title: args.title,
    createdTime: args.createdTime,
    lastUpdatedTime: args.lastUpdatedTime,
  };

  return makeSuccessResult(feedSource);
}
