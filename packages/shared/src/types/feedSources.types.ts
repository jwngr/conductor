import {serverTimestamp} from 'firebase/firestore';

import {makeId} from '@shared/lib/utils.shared';

import type {Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a {@link FeedSource}'s unique identifier. Prefer this over plain strings.
 */
export type FeedSourceId = string & {readonly __brand: 'FeedSourceIdBrand'};

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
 * Checks if a value is a valid {@link FeedSourceId}.
 */
export function isFeedSourceId(feedSourceId: unknown): feedSourceId is FeedSourceId {
  return typeof feedSourceId === 'string' && feedSourceId.length > 0;
}

/**
 * Creates a {@link FeedSourceId} from a plain string. Returns an error if the string is not valid.
 */
export function makeFeedSourceId(maybeFeedSourceId: string = makeId()): Result<FeedSourceId> {
  if (!isFeedSourceId(maybeFeedSourceId)) {
    return makeErrorResult(new Error(`Invalid feed source ID: "${maybeFeedSourceId}"`));
  }
  return makeSuccessResult(maybeFeedSourceId);
}

/**
 * Creates a {@link FeedSource} object.
 */
export function makeFeedSource(
  args: Omit<FeedSource, 'feedSourceId' | 'createdTime' | 'lastUpdatedTime'>
): Result<FeedSource> {
  const feedSourceIdResult = makeFeedSourceId();
  if (!feedSourceIdResult.success) return feedSourceIdResult;
  const feedSourceId = feedSourceIdResult.value;

  const feedSource: FeedSource = {
    feedSourceId,
    createdTime: serverTimestamp(),
    lastUpdatedTime: serverTimestamp(),
    url: args.url,
    title: args.title,
  };

  return makeSuccessResult(feedSource);
}
