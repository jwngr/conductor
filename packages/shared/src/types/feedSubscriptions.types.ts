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

export enum FeedSubscriptionStatus {
  /**
   * The feed is in the process of being subscribed to. Should only be set for recently created feed
   * subscriptions.
   */
  Pending = 'PENDING',
  /**
   * The user has successfully subscribed to the feed.
   */
  Subscribed = 'SUBSCRIBED',
  /**
   * The user has unsubscribed from the feed. This is separate from deleting the feed subscription,
   * which removes the document from the database.
   */
  Unsubscribed = 'UNSUBSCRIBED',
  /**
   * The feed subscription has errored.
   */
  Errored = 'ERRORED',
}

interface BaseFeedSubscription {
  readonly feedSubscriptionId: FeedSubscriptionId;
  readonly url: string;
  readonly userId: UserId;
  readonly status: FeedSubscriptionStatus;
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
  readonly subscribedTime?: FieldValue;
  readonly unsubscribedTime?: FieldValue;
}

interface PendingFeedSubscription extends BaseFeedSubscription {
  readonly status: FeedSubscriptionStatus.Pending;
}

interface SubscribedFeedSubscription extends BaseFeedSubscription {
  readonly status: FeedSubscriptionStatus.Subscribed;
  readonly subscribedTime: FieldValue;
}

interface UnsubscribedFeedSubscription extends BaseFeedSubscription {
  readonly status: FeedSubscriptionStatus.Unsubscribed;
  readonly subscribedTime: FieldValue;
  readonly unsubscribedTime: FieldValue;
}

interface ErroredFeedSubscription extends BaseFeedSubscription {
  readonly status: FeedSubscriptionStatus.Errored;
}

export type FeedSubscription =
  | PendingFeedSubscription
  | SubscribedFeedSubscription
  | UnsubscribedFeedSubscription
  | ErroredFeedSubscription;
