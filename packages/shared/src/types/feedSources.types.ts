import {z} from 'zod';

import {parseZodResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeUuid} from '@shared/lib/utils.shared';

import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {BaseStoreItem, Timestamp} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a {@link FeedSource}'s unique identifier. Prefer this over plain strings.
 */
export type FeedSourceId = string & {readonly __brand: 'FeedSourceIdBrand'};

export const FeedSourceIdSchema = z.string().uuid();

const FeedSourceSchema = z.object({
  feedSourceId: FeedSourceIdSchema,
  url: z.string().url(),
  title: z.string().min(1),
  createdTime: z.date(),
  lastUpdatedTime: z.date(),
});

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
 * Parses a {@link FeedSourceId} from a plain string. Returns an `ErrorResult` if the string is not
 * valid.
 */
export function parseFeedSourceId(maybeFeedSourceId: string): Result<FeedSourceId> {
  const parsedResult = parseZodResult(FeedSourceIdSchema, maybeFeedSourceId);
  if (!parsedResult.success) {
    return prefixResultIfError(parsedResult, 'Invalid feed source ID');
  }
  return makeSuccessResult(parsedResult.value as FeedSourceId);
}

/**
 * Creates a new random {@link FeedSourceId}.
 */
export function makeFeedSourceId(): FeedSourceId {
  return makeUuid<FeedSourceId>();
}

/**
 * Creates a {@link FeedSource} object.
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

/**
 * Parses a {@link FeedSource} from an unknown value. Returns an `ErrorResult` if the value is not
 * valid.
 */
export function parseFeedSource(maybeFeedSource: unknown): Result<FeedSource> {
  const parsedFeedSourceResult = parseZodResult(FeedSourceSchema, maybeFeedSource);
  if (!parsedFeedSourceResult.success) {
    return prefixResultIfError(parsedFeedSourceResult, 'Invalid feed source');
  }

  const parsedIdResult = parseFeedSourceId(parsedFeedSourceResult.value.feedSourceId);
  if (!parsedIdResult.success) return parsedIdResult;

  const {url, title, createdTime, lastUpdatedTime} = parsedFeedSourceResult.value;
  return makeSuccessResult({
    feedSourceId: parsedIdResult.value,
    url,
    title,
    createdTime: new Date(createdTime) as unknown as Timestamp,
    lastUpdatedTime: new Date(lastUpdatedTime) as unknown as Timestamp,
  });
}
