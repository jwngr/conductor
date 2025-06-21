import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';
import {ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE} from '@shared/lib/feedSubscriptions.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedType} from '@shared/types/feedSourceTypes.types';
import type {
  FeedSubscription,
  FeedSubscriptionId,
  IntervalFeedSubscription,
  RssFeedSubscription,
} from '@shared/types/feedSubscriptions.types';

export const INTERVAL_1_USER_FEED_SUBSCRIPTION_ID =
  'b350b50e-5ae7-485c-9a41-332948d4eba4' as FeedSubscriptionId;
export const PERSONAL_BLOG_RSS_FEED_SUBSCRIPTION_ID =
  'a782c40e-5ae7-485c-9a41-332948d4ea84' as FeedSubscriptionId;

const interval1UserFeedSubscription: Omit<IntervalFeedSubscription, 'accountId'> = {
  feedSubscriptionId: INTERVAL_1_USER_FEED_SUBSCRIPTION_ID,
  feedType: FeedType.Interval,
  intervalSeconds: 300,
  lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

const personalBlogRssFeedSubscription: Omit<RssFeedSubscription, 'accountId'> = {
  feedSubscriptionId: PERSONAL_BLOG_RSS_FEED_SUBSCRIPTION_ID,
  feedType: FeedType.RSS,
  url: 'https://jwn.gr/feed.xml',
  title: "Jacob Wenger's Blog",
  lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

const mockUserFeedSubscriptions: Array<Omit<FeedSubscription, 'accountId'>> = [
  interval1UserFeedSubscription,
  personalBlogRssFeedSubscription,
];

export const getMockUserFeedSubscriptions = (args: {
  readonly accountId: AccountId;
}): FeedSubscription[] => {
  const {accountId} = args;

  return mockUserFeedSubscriptions.map((subscription) => {
    return {
      ...subscription,
      accountId,
    } as FeedSubscription;
  });
};
