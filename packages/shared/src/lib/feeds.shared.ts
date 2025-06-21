import {assertNever} from '@shared/lib/utils.shared';

import type {
  ExtensionFeed,
  IntervalFeed,
  PocketExportFeed,
  PwaFeed,
  RssFeed,
  YouTubeChannelFeed,
} from '@shared/types/feeds.types';
import {FeedType} from '@shared/types/feedSourceTypes.types';
import type {
  IntervalFeedSubscription,
  RssFeedSubscription,
  YouTubeChannelFeedSubscription,
} from '@shared/types/feedSubscriptions.types';

export const PWA_FEED: PwaFeed = {
  feedType: FeedType.PWA,
};

export const EXTENSION_FEED: ExtensionFeed = {
  feedType: FeedType.Extension,
};

export const POCKET_EXPORT_FEED: PocketExportFeed = {
  feedType: FeedType.PocketExport,
};

export function makeRssFeed(args: {readonly subscription: RssFeedSubscription}): RssFeed {
  const {subscription} = args;
  return {
    feedType: FeedType.RSS,
    feedSubscriptionId: subscription.feedSubscriptionId,
  };
}

export function makeYouTubeChannelFeed(args: {
  readonly subscription: YouTubeChannelFeedSubscription;
}): YouTubeChannelFeed {
  const {subscription} = args;
  return {
    feedType: FeedType.YouTubeChannel,
    feedSubscriptionId: subscription.feedSubscriptionId,
  };
}

export function makeIntervalFeed(args: {
  readonly subscription: IntervalFeedSubscription;
}): IntervalFeed {
  const {subscription} = args;
  return {
    feedType: FeedType.Interval,
    feedSubscriptionId: subscription.feedSubscriptionId,
  };
}

export function getNameForFeedType(feedType: FeedType): string {
  switch (feedType) {
    case FeedType.RSS:
      return 'RSS';
    case FeedType.YouTubeChannel:
      return 'YouTube';
    case FeedType.Interval:
      return 'Interval';
    case FeedType.PWA:
      return 'PWA';
    case FeedType.Extension:
      return 'Extension';
    case FeedType.PocketExport:
      return 'Pocket';
    default:
      assertNever(feedType);
  }
}
