import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';
import {
  ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  makeFeedSubscriptionId,
} from '@shared/lib/feedSubscriptions.shared';

import {FeedType} from '@shared/types/feeds.types';
import type {
  RssFeedSubscription,
  YouTubeChannelFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import type {YouTubeChannelId} from '@shared/types/youtube.types';

export const personalBlogRssFeedSubscription: Omit<RssFeedSubscription, 'accountId'> = {
  feedSubscriptionId: makeFeedSubscriptionId(),
  feedType: FeedType.RSS,
  url: 'https://jwn.gr/feed.xml',
  title: "Jacob Wenger's Blog",
  lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

export const geoWizardYouTubeChannelFeedSubscription: Omit<
  YouTubeChannelFeedSubscription,
  'accountId'
> = {
  feedSubscriptionId: makeFeedSubscriptionId(),
  feedType: FeedType.YouTubeChannel,
  channelId: 'GeoWizard' as YouTubeChannelId,
  lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

export const jonnyHarrisYouTubeChannelFeedSubscription: Omit<
  YouTubeChannelFeedSubscription,
  'accountId'
> = {
  feedSubscriptionId: makeFeedSubscriptionId(),
  feedType: FeedType.YouTubeChannel,
  channelId: 'johnnyharris' as YouTubeChannelId,
  lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

export const jetLagYouTubeChannelFeedSubscription: Omit<
  YouTubeChannelFeedSubscription,
  'accountId'
> = {
  feedSubscriptionId: makeFeedSubscriptionId(),
  feedType: FeedType.YouTubeChannel,
  channelId: 'jetlagthegame' as YouTubeChannelId,
  lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

export const gmtkYouTubeChannelFeedSubscription: Omit<YouTubeChannelFeedSubscription, 'accountId'> =
  {
    feedSubscriptionId: makeFeedSubscriptionId(),
    feedType: FeedType.YouTubeChannel,
    channelId: 'GMTK' as YouTubeChannelId,
    lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    createdTime: new Date('2025-06-20T03:30:11.282Z'),
    lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
  };
