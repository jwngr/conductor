import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';
import {makeUuid} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {
  IntervalMiniFeedSource,
  RssMiniFeedSource,
  YouTubeChannelMiniFeedSource,
} from '@shared/types/feedSources.types';
import type {
  IntervalMiniUserFeedSubscription,
  IntervalUserFeedSubscription,
  RssMiniUserFeedSubscription,
  RssUserFeedSubscription,
  UserFeedSubscriptionId,
  YouTubeChannelMiniUserFeedSubscription,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';

/**
 * Creates a new random {@link UserFeedSubscriptionId}.
 */
export function makeUserFeedSubscriptionId(): UserFeedSubscriptionId {
  return makeUuid<UserFeedSubscriptionId>();
}

export function makeRssUserFeedSubscription(args: {
  readonly accountId: AccountId;
  readonly miniFeedSource: RssMiniFeedSource;
}): RssUserFeedSubscription {
  const {miniFeedSource, accountId} = args;

  return {
    userFeedSubscriptionId: makeUserFeedSubscriptionId(),
    accountId,
    miniFeedSource,
    isActive: true,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeYouTubeChannelUserFeedSubscription(args: {
  readonly accountId: AccountId;
  readonly miniFeedSource: YouTubeChannelMiniFeedSource;
}): YouTubeChannelUserFeedSubscription {
  const {miniFeedSource, accountId} = args;

  return {
    userFeedSubscriptionId: makeUserFeedSubscriptionId(),
    accountId,
    miniFeedSource,
    isActive: true,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeIntervalUserFeedSubscription(args: {
  readonly accountId: AccountId;
  readonly miniFeedSource: IntervalMiniFeedSource;
}): IntervalUserFeedSubscription {
  const {miniFeedSource, accountId} = args;

  return {
    userFeedSubscriptionId: makeUserFeedSubscriptionId(),
    accountId,
    miniFeedSource,
    isActive: true,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

export function makeRssMiniUserFeedSubscription(args: {
  readonly userFeedSubscription: RssUserFeedSubscription;
}): RssMiniUserFeedSubscription {
  const {userFeedSubscription} = args;
  return {
    feedSource: userFeedSubscription.miniFeedSource,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    isActive: true,
  };
}

export function makeYouTubeChannelMiniUserFeedSubscription(args: {
  readonly userFeedSubscription: YouTubeChannelUserFeedSubscription;
}): YouTubeChannelMiniUserFeedSubscription {
  const {userFeedSubscription} = args;
  return {
    feedSource: userFeedSubscription.miniFeedSource,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    isActive: true,
  };
}

export function makeIntervalMiniUserFeedSubscription(args: {
  readonly userFeedSubscription: IntervalUserFeedSubscription;
}): IntervalMiniUserFeedSubscription {
  const {userFeedSubscription} = args;
  return {
    feedSource: userFeedSubscription.miniFeedSource,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    isActive: true,
  };
}
