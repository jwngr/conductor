import {serverTimestamp} from 'firebase/firestore';

import {makeId} from '@shared/lib/utils';

import {Feed, FeedId} from '@shared/types/feeds.types';
import {makeErrorResult, makeSuccessResult, Result} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';
import {BaseStoreItem, Timestamp} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a {@link UserFeedSubscription}'s unique identifier. Prefer this over
 * plain strings.
 */
export type UserFeedSubscriptionId = string & {readonly __brand: 'UserFeedSubscriptionIdBrand'};

/**
 * An individual user's subscription to a feed.
 *
 * A single {@link Feed} can have multiple {@link UserFeedSubscription}s, one for each
 * {@link User} subscribed to it.
 *
 * These are not deleted when a user unsubscribes from a feed. Instead, they are marked as
 * inactive. They are only deleted when a user is wiped out.
 */
export interface UserFeedSubscription extends BaseStoreItem {
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly feedId: FeedId;
  readonly userId: UserId;
  readonly url: string;
  readonly title: string;
  readonly isActive: boolean;
  readonly unsubscribedTime?: Timestamp;
}

/**
 * Checks if a value is a valid {@link UserFeedSubscriptionId}.
 */
export function isUserFeedSubscriptionId(
  userFeedSubscriptionId: unknown
): userFeedSubscriptionId is UserFeedSubscriptionId {
  return typeof userFeedSubscriptionId === 'string' && userFeedSubscriptionId.length > 0;
}

/**
 * Creates a {@link UserFeedSubscriptionId} from a plain string. Returns an error if the string
 * is not valid.
 */
export function makeUserFeedSubscriptionId(
  maybeUserFeedSubscriptionId: string = makeId()
): Result<UserFeedSubscriptionId> {
  if (!isUserFeedSubscriptionId(maybeUserFeedSubscriptionId)) {
    return makeErrorResult(
      new Error(`Invalid user feed subscription ID: "${maybeUserFeedSubscriptionId}"`)
    );
  }
  return makeSuccessResult(maybeUserFeedSubscriptionId);
}

/**
 * Creates a {@link UserFeedSubscription} object.
 */
export function makeUserFeedSubscription(args: {
  readonly feed: Feed;
  readonly userId: UserId;
}): Result<UserFeedSubscription> {
  const {feed, userId} = args;
  const userFeedSubscriptionIdResult = makeUserFeedSubscriptionId();
  if (!userFeedSubscriptionIdResult.success) return userFeedSubscriptionIdResult;
  const userFeedSubscriptionId = userFeedSubscriptionIdResult.value;

  const userFeedSubscription: UserFeedSubscription = {
    userFeedSubscriptionId,
    userId,
    feedId: feed.feedId,
    url: feed.url,
    title: feed.title,
    isActive: true,
    createdTime: serverTimestamp(),
    lastUpdatedTime: serverTimestamp(),
  };

  return makeSuccessResult(userFeedSubscription);
}
