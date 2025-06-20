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
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  UserFeedSubscriptionId,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';

export const PWA_FEED_SOURCE: PwaFeedSource = {
  feedSourceType: FeedSourceType.PWA,
};

export const EXTENSION_FEED_SOURCE: ExtensionFeedSource = {
  feedSourceType: FeedSourceType.Extension,
};

export const POCKET_EXPORT_FEED_SOURCE: PocketExportFeedSource = {
  feedSourceType: FeedSourceType.PocketExport,
};

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

export function getNameForFeedSourceType(feedSourceType: FeedSourceType): string {
  switch (feedSourceType) {
    case FeedSourceType.RSS:
      return 'RSS';
    case FeedSourceType.YouTubeChannel:
      return 'YouTube';
    case FeedSourceType.Interval:
      return 'Interval';
    case FeedSourceType.PWA:
      return 'PWA';
    case FeedSourceType.Extension:
      return 'Extension';
    case FeedSourceType.PocketExport:
      return 'Pocket';
    default:
      assertNever(feedSourceType);
  }
}

export function getFeedSubscriptionIdForFeedSource(
  feedSource: FeedSource
): UserFeedSubscriptionId | null {
  switch (feedSource.feedSourceType) {
    case FeedSourceType.RSS:
    case FeedSourceType.YouTubeChannel:
    case FeedSourceType.Interval:
      return feedSource.userFeedSubscriptionId;
    case FeedSourceType.PWA:
    case FeedSourceType.Extension:
    case FeedSourceType.PocketExport:
      return null;
    default:
      assertNever(feedSource);
  }
}
