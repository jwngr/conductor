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
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';

export const PWA_FEED: PwaFeed = {
  feedType: FeedType.PWA,
};

export const EXTENSION_FEED: ExtensionFeed = {
  feedType: FeedType.Extension,
};

export const POCKET_EXPORT_FEED: PocketExportFeed = {
  feedType: FeedType.PocketExport,
};

export function makeRssFeed(args: {
  readonly userFeedSubscription: RssUserFeedSubscription;
}): RssFeed {
  const {userFeedSubscription} = args;
  return {
    feedType: FeedType.RSS,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  };
}

export function makeYouTubeChannelFeed(args: {
  readonly userFeedSubscription: YouTubeChannelUserFeedSubscription;
}): YouTubeChannelFeed {
  const {userFeedSubscription} = args;
  return {
    feedType: FeedType.YouTubeChannel,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  };
}

export function makeIntervalFeed(args: {
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
