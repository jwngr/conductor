import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';
import {makeUuid} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedType} from '@shared/types/feedSourceTypes.types';
import type {
  FeedSubscriptionId,
  IntervalFeedSubscription,
  RssFeedSubscription,
  YouTubeChannelFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import type {YouTubeChannelId} from '@shared/types/youtube.types';

/**
 * Creates a new random {@link FeedSubscriptionId}.
 */
export function makeFeedSubscriptionId(): FeedSubscriptionId {
  return makeUuid<FeedSubscriptionId>();
}

export function makeRssFeedSubscription(args: {
  readonly accountId: AccountId;
  readonly url: string;
  readonly title: string;
}): RssFeedSubscription {
  const {accountId, url, title} = args;

  return {
    feedType: FeedType.RSS,
    url,
    title,
    feedSubscriptionId: makeFeedSubscriptionId(),
    accountId,
    isActive: true,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeYouTubeChannelFeedSubscription(args: {
  readonly accountId: AccountId;
  readonly channelId: YouTubeChannelId;
}): YouTubeChannelFeedSubscription {
  const {accountId, channelId} = args;

  return {
    feedType: FeedType.YouTubeChannel,
    channelId,
    feedSubscriptionId: makeFeedSubscriptionId(),
    accountId,
    isActive: true,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeIntervalFeedSubscription(args: {
  readonly accountId: AccountId;
  readonly intervalSeconds: number;
}): IntervalFeedSubscription {
  const {accountId, intervalSeconds} = args;

  return {
    feedType: FeedType.Interval,
    intervalSeconds,
    feedSubscriptionId: makeFeedSubscriptionId(),
    accountId,
    isActive: true,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}
