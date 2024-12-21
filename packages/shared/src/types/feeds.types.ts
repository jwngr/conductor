import {makeId} from '@shared/lib/utils';

import {makeErrorResult, makeSuccessResult, Result} from '@shared/types/result.types';
import {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a feed's unique identifier. Prefer this over plain strings.
 */
export type FeedId = string & {readonly __brand: 'FeedIdBrand'};

/**
 * Checks if a value is a valid `FeedId`.
 */
export function isFeedId(feedId: unknown): feedId is FeedId {
  return typeof feedId === 'string' && feedId.length > 0;
}

/**
 * Creates a `FeedId` from a plain string. Returns an error if the string is not a valid `FeedId`.
 */
export function makeFeedId(maybeFeedId: string = makeId()): Result<FeedId> {
  if (!isFeedId(maybeFeedId)) {
    return makeErrorResult(new Error(`Invalid feed ID: "${maybeFeedId}"`));
  }
  return makeSuccessResult(maybeFeedId);
}

export interface Feed extends BaseStoreItem {
  readonly feedId: FeedId;
  readonly url: string;
  readonly title: string;
}
