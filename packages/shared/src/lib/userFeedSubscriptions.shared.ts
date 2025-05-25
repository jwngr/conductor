import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';
import {makeUuid} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  UserFeedSubscriptionId,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';
import type {YouTubeChannelId} from '@shared/types/youtube.types';

/**
 * Creates a new random {@link UserFeedSubscriptionId}.
 */
export function makeUserFeedSubscriptionId(): UserFeedSubscriptionId {
  return makeUuid<UserFeedSubscriptionId>();
}

export function makeRssUserFeedSubscription(args: {
  readonly accountId: AccountId;
  readonly url: string;
  readonly title: string;
}): RssUserFeedSubscription {
  const {accountId, url, title} = args;

  return {
    feedSourceType: FeedSourceType.RSS,
    url,
    title,
    userFeedSubscriptionId: makeUserFeedSubscriptionId(),
    accountId,
    isActive: true,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeYouTubeChannelUserFeedSubscription(args: {
  readonly accountId: AccountId;
  readonly channelId: YouTubeChannelId;
}): YouTubeChannelUserFeedSubscription {
  const {accountId, channelId} = args;

  return {
    feedSourceType: FeedSourceType.YouTubeChannel,
    channelId,
    userFeedSubscriptionId: makeUserFeedSubscriptionId(),
    accountId,
    isActive: true,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeIntervalUserFeedSubscription(args: {
  readonly accountId: AccountId;
  readonly intervalSeconds: number;
}): IntervalUserFeedSubscription {
  const {accountId, intervalSeconds} = args;

  return {
    feedSourceType: FeedSourceType.Interval,
    intervalSeconds,
    userFeedSubscriptionId: makeUserFeedSubscriptionId(),
    accountId,
    isActive: true,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}
