import {PERSONAL_YOUTUBE_CHANNEL_ID} from '@shared/lib/constants.shared';
import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';
import {
  ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  makeFeedSubscriptionId,
} from '@shared/lib/feedSubscriptions.shared';
import {objectMapValues} from '@shared/lib/objectUtils.shared';

import {BootstrapFeedSubscriptionId} from '@shared/types/bootstrap.types';
import {FeedType} from '@shared/types/feeds.types';
import type {
  FeedSubscription,
  IntervalFeedSubscription,
  RssFeedSubscription,
  YouTubeChannelFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import type {AccountId} from '@shared/types/ids.types';
import type {YouTubeChannelId} from '@shared/types/youtube.types';

export const INTERVAL_1_USER_FEED_SUBSCRIPTION_ID = makeFeedSubscriptionId();
export const PERSONAL_BLOG_RSS_FEED_SUBSCRIPTION_ID = makeFeedSubscriptionId();
export const PERSONAL_YOUTUBE_CHANNEL_FEED_SUBSCRIPTION_ID = makeFeedSubscriptionId();
export const GEO_WIZARD_YOUTUBE_CHANNEL_FEED_SUBSCRIPTION_ID = makeFeedSubscriptionId();
export const JONNY_HARRIS_YOUTUBE_CHANNEL_FEED_SUBSCRIPTION_ID = makeFeedSubscriptionId();
export const JET_LAG_YOUTUBE_CHANNEL_FEED_SUBSCRIPTION_ID = makeFeedSubscriptionId();
export const GMTK_YOUTUBE_CHANNEL_FEED_SUBSCRIPTION_ID = makeFeedSubscriptionId();

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

const geoWizardYouTubeChannelFeedSubscription: Omit<YouTubeChannelFeedSubscription, 'accountId'> = {
  feedSubscriptionId: GEO_WIZARD_YOUTUBE_CHANNEL_FEED_SUBSCRIPTION_ID,
  feedType: FeedType.YouTubeChannel,
  channelId: 'GeoWizard' as YouTubeChannelId,
  lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

const jonnyHarrisYouTubeChannelFeedSubscription: Omit<YouTubeChannelFeedSubscription, 'accountId'> =
  {
    feedSubscriptionId: JONNY_HARRIS_YOUTUBE_CHANNEL_FEED_SUBSCRIPTION_ID,
    feedType: FeedType.YouTubeChannel,
    channelId: 'johnnyharris' as YouTubeChannelId,
    lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    createdTime: new Date('2025-06-20T03:30:11.282Z'),
    lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
  };

const jetLagYouTubeChannelFeedSubscription: Omit<YouTubeChannelFeedSubscription, 'accountId'> = {
  feedSubscriptionId: JET_LAG_YOUTUBE_CHANNEL_FEED_SUBSCRIPTION_ID,
  feedType: FeedType.YouTubeChannel,
  channelId: 'jetlagthegame' as YouTubeChannelId,
  lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

const gmtkYouTubeChannelFeedSubscription: Omit<YouTubeChannelFeedSubscription, 'accountId'> = {
  feedSubscriptionId: GMTK_YOUTUBE_CHANNEL_FEED_SUBSCRIPTION_ID,
  feedType: FeedType.YouTubeChannel,
  channelId: 'GMTK' as YouTubeChannelId,
  lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

const mockUserFeedSubscriptions: Record<
  BootstrapFeedSubscriptionId,
  Omit<FeedSubscription, 'accountId'>
> = {
  // Interval feeds.
  [BootstrapFeedSubscriptionId.Interval1]: interval1UserFeedSubscription,

  // RSS feeds.
  [BootstrapFeedSubscriptionId.RssPersonalBlog]: personalBlogRssFeedSubscription,

  // YouTube channel feeds.
  [BootstrapFeedSubscriptionId.YoutubeChannelJacobWenger]: personalYouTubeChannelFeedSubscription,
  [BootstrapFeedSubscriptionId.YoutubeChannelGeoWizard]: geoWizardYouTubeChannelFeedSubscription,
  [BootstrapFeedSubscriptionId.YoutubeChannelJonnyHarris]:
    jonnyHarrisYouTubeChannelFeedSubscription,
  [BootstrapFeedSubscriptionId.YoutubeChannelJetLag]: jetLagYouTubeChannelFeedSubscription,
  [BootstrapFeedSubscriptionId.YoutubeChannelGMTK]: gmtkYouTubeChannelFeedSubscription,
};

export const getMockUserFeedSubscriptions = (args: {
  readonly accountId: AccountId;
}): Record<BootstrapFeedSubscriptionId, FeedSubscription> => {
  const {accountId} = args;

  return objectMapValues(mockUserFeedSubscriptions, (subscription) => {
    return {
      ...subscription,
      accountId,
    } as FeedSubscription;
  });
};
