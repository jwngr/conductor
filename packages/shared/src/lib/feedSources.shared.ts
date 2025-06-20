import {assertNever} from '@shared/lib/utils.shared';

import type {
  ExtensionFeed,
  Feed,
  IntervalFeed,
  PocketExportFeed,
  PwaFeed,
  RssFeed,
  YouTubeChannelFeed,
} from '@shared/types/feeds.types';
import {FeedType} from '@shared/types/feedSourceTypes.types';
import type {
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  UserFeedSubscriptionId,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';

export const PWA_FEED_SOURCE: PwaFeed = {
  feedType: FeedType.PWA,
};

export const EXTENSION_FEED_SOURCE: ExtensionFeed = {
  feedType: FeedType.Extension,
};

export const POCKET_EXPORT_FEED_SOURCE: PocketExportFeed = {
  feedType: FeedType.PocketExport,
};

export function makeRssFeedSource(args: {
  readonly userFeedSubscription: RssUserFeedSubscription;
}): RssFeed {
  const {userFeedSubscription} = args;
  return {
    feedType: FeedType.RSS,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  };
}

export function makeYouTubeChannelFeedSource(args: {
  readonly userFeedSubscription: YouTubeChannelUserFeedSubscription;
}): YouTubeChannelFeed {
  const {userFeedSubscription} = args;
  return {
    feedType: FeedType.YouTubeChannel,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  };
}

export function makeIntervalFeedSource(args: {
  readonly userFeedSubscription: IntervalUserFeedSubscription;
}): IntervalFeed {
  const {userFeedSubscription} = args;
  return {
    feedType: FeedType.Interval,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
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

export function getFeedSubscriptionIdForFeedSource(
  feedSource: Feed
): UserFeedSubscriptionId | null {
  switch (feedSource.feedType) {
    case FeedType.RSS:
    case FeedType.YouTubeChannel:
    case FeedType.Interval:
      return feedSource.userFeedSubscriptionId;
    case FeedType.PWA:
    case FeedType.Extension:
    case FeedType.PocketExport:
      return null;
    default:
      assertNever(feedSource);
  }
}
