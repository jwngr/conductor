import {FeedSourceType} from '@shared/types/feedItems.types';
import type {
  IntervalFeedSource,
  RssFeedSource,
  YouTubeChannelFeedSource,
} from '@shared/types/feedItems.types';
import type {
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';

export function makeRssFeedSource(args: {
  readonly userFeedSubscription: RssUserFeedSubscription;
}): RssFeedSource {
  const {userFeedSubscription} = args;
  return {
    feedSourceType: FeedSourceType.RSS,
    url: userFeedSubscription.url,
    title: userFeedSubscription.title,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  };
}

export function makeYouTubeChannelFeedSource(args: {
  readonly userFeedSubscription: YouTubeChannelUserFeedSubscription;
}): YouTubeChannelFeedSource {
  const {userFeedSubscription} = args;
  return {
    feedSourceType: FeedSourceType.YouTubeChannel,
    channelId: userFeedSubscription.channelId,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  };
}

export function makeIntervalFeedSource(args: {
  readonly userFeedSubscription: IntervalUserFeedSubscription;
}): IntervalFeedSource {
  const {userFeedSubscription} = args;
  return {
    feedSourceType: FeedSourceType.Interval,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  };
}
