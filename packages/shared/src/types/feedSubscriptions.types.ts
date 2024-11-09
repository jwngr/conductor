import {FieldValue} from 'firebase/firestore';

import {makeErrorResult, makeSuccessResult, Result} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';

/**
 * Strongly-typed type for a feed subscription's unique identifier. Prefer this over plain strings.
 */
export type FeedSubscriptionId = string & {readonly __brand: 'FeedSubscriptionIdBrand'};

/**
 * Checks if a value is a valid `FeedSubscriptionId`.
 */
export function isFeedSubscriptionId(
  feedSubscriptionId: unknown
): feedSubscriptionId is FeedSubscriptionId {
  return typeof feedSubscriptionId === 'string' && feedSubscriptionId.length > 0;
}

/**
 * Creates a `FeedSubscriptionId` from a plain string. Returns an error if the string is not a valid
 * `FeedSubscriptionId`.
 */
export function createFeedSubscriptionId(
  maybeFeedSubscriptionId: string
): Result<FeedSubscriptionId> {
  if (!isFeedSubscriptionId(maybeFeedSubscriptionId)) {
    return makeErrorResult(new Error(`Invalid feed subscription ID: "${maybeFeedSubscriptionId}"`));
  }
  return makeSuccessResult(maybeFeedSubscriptionId);
}

export interface FeedSubscription {
  readonly feedSubscriptionId: FeedSubscriptionId;
  readonly url: string;
  readonly userId: UserId;
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
}
