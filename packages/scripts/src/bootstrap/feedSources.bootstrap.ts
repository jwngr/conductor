import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {IntervalFeedSource} from '@shared/types/feedSources.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {
  RssUserFeedSubscription,
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

export const INTERVAL_1_USER_FEED_SUBSCRIPTION_ID =
  'b350b50e-5ae7-485c-9a41-332948d4eba4' as UserFeedSubscriptionId;
export const PERSONAL_BLOG_RSS_FEED_SUBSCRIPTION_ID =
  'a782c40e-5ae7-485c-9a41-332948d4ea84' as UserFeedSubscriptionId;

const interval1UserFeedSubscription: Omit<IntervalFeedSource, 'accountId'> = {
  userFeedSubscriptionId: INTERVAL_1_USER_FEED_SUBSCRIPTION_ID,
  feedSourceType: FeedSourceType.Interval,
  intervalSeconds: 300,
  isActive: true,
  deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
  unsubscribedTime: undefined,
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

const personalBlogRssFeedSubscription: Omit<RssUserFeedSubscription, 'accountId'> = {
  userFeedSubscriptionId: PERSONAL_BLOG_RSS_FEED_SUBSCRIPTION_ID,
  feedSourceType: FeedSourceType.RSS,
  url: 'https://jwn.gr/feed.xml',
  title: "Jacob Wenger's Blog",
  isActive: true,
  deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
  unsubscribedTime: undefined,
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

const mockUserFeedSubscriptions: Array<Omit<UserFeedSubscription, 'accountId'>> = [
  interval1UserFeedSubscription,
  personalBlogRssFeedSubscription,
];

export const getMockFeedSources = (args: {readonly accountId: AccountId}): FeedSource[] => {
  const {accountId} = args;

  return mockUserFeedSubscriptions.map((subscription) => {
    return {
      ...subscription,
      accountId,
    } as UserFeedSubscription;
  });
};
