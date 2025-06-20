import {assertNever} from '@shared/lib/utils.shared';

import type {
  ExtensionFeedSource,
  FeedSource,
  IntervalFeedSource,
  PocketExportFeedSource,
  PwaFeedSource,
  RssFeedSource,
  YouTubeChannelFeedSource,
} from '@shared/types/feedSources.types';
import {FeedType} from '@shared/types/feedSourceTypes.types';
import type {
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  UserFeedSubscriptionId,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';

export const PWA_FEED_SOURCE: PwaFeedSource = {
  feedSourceType: FeedType.PWA,
};

export const EXTENSION_FEED_SOURCE: ExtensionFeedSource = {
  feedSourceType: FeedType.Extension,
};

export const POCKET_EXPORT_FEED_SOURCE: PocketExportFeedSource = {
  feedSourceType: FeedType.PocketExport,
};

export function makeRssFeedSource(args: {
  readonly userFeedSubscription: RssUserFeedSubscription;
}): RssFeedSource {
  const {userFeedSubscription} = args;
  return {
    feedSourceType: FeedType.RSS,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  };
}

export function makeYouTubeChannelFeedSource(args: {
  readonly userFeedSubscription: YouTubeChannelUserFeedSubscription;
}): YouTubeChannelFeedSource {
  const {userFeedSubscription} = args;
  return {
    feedSourceType: FeedType.YouTubeChannel,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  };
}

export function makeIntervalFeedSource(args: {
  readonly userFeedSubscription: IntervalUserFeedSubscription;
}): IntervalFeedSource {
  const {userFeedSubscription} = args;
  return {
    feedSourceType: FeedType.Interval,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  };
}

export function getNameForFeedSourceType(feedSourceType: FeedType): string {
  switch (feedSourceType) {
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
      assertNever(feedSourceType);
  }
}

export function getFeedSubscriptionIdForFeedSource(
  feedSource: FeedSource
): UserFeedSubscriptionId | null {
  switch (feedSource.feedSourceType) {
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
