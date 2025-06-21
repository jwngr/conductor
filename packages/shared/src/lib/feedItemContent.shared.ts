import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult, syncTry} from '@shared/lib/errorUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';
import {isXkcdComicUrl} from '@shared/lib/xkcd.shared';
import {isYouTubeVideoUrl} from '@shared/lib/youtube.shared';

import {FeedItemContentType} from '@shared/types/feedItemContent.types';
import type {FeedItemContent, IntervalFeedItemContent} from '@shared/types/feedItemContent.types';
import type {FeedItem} from '@shared/types/feedItems.types';

export const DEFAULT_FEED_ITEM_CONTENT_TYPE = FeedItemContentType.Article;

/**
 * Returns the best guess {@link FeedItemContentType} for a given URL based on a set of rules and
 * heuristics.
 */
function getFeedItemContentTypeFromUrl(
  url: string
): Exclude<FeedItemContentType, FeedItemContentType.Interval> {
  const parsedUrlResult = syncTry(() => new URL(url));
  if (!parsedUrlResult.success) {
    // Parsing the URL may throw. If it does, log the error and use a default value.
    const betterError = prefixErrorResult(parsedUrlResult, 'Error parsing feed item type from URL');
    logger.error(betterError.error, {url});
    return DEFAULT_FEED_ITEM_CONTENT_TYPE;
  }

  const parsedUrl = parsedUrlResult.value;

  // Check for exact matches against allowed hostnames.
  const hostname = parsedUrl.hostname.toLowerCase();
  const twitterHosts = ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'];
  if (isYouTubeVideoUrl(parsedUrl.href)) {
    return FeedItemContentType.YouTube;
  } else if (isXkcdComicUrl(parsedUrl.href)) {
    return FeedItemContentType.Xkcd;
  } else if (twitterHosts.includes(hostname)) {
    return FeedItemContentType.Tweet;
  }

  // Fallback.
  return DEFAULT_FEED_ITEM_CONTENT_TYPE;
}

/**
 * Creates a new local {@link FeedItemContent} object given a URL and other metadata.
 */
export function makeFeedItemContentFromUrl(args: {
  readonly url: string;
  readonly title: string;
  readonly description: string | null;
  readonly outgoingLinks: string[];
  readonly summary: string | null;
}): Exclude<FeedItemContent, FeedItemContentType.Interval> {
  const {url, title, description, outgoingLinks, summary} = args;

  const feedItemContentType = getFeedItemContentTypeFromUrl(url);

  switch (feedItemContentType) {
    case FeedItemContentType.Article:
    case FeedItemContentType.Video:
    case FeedItemContentType.Website:
    case FeedItemContentType.Tweet:
    case FeedItemContentType.YouTube:
      return {feedItemContentType, url, title, description, outgoingLinks, summary};
    case FeedItemContentType.Xkcd:
      return {
        feedItemContentType,
        url,
        title,
        summary,
        // Remaining fields will be filled in by import.
        altText: '',
        imageUrlSmall: '',
        imageUrlLarge: '',
      };
    default:
      assertNever(feedItemContentType);
  }
}

export function makeIntervalFeedItemContent(args: {
  readonly intervalSeconds: number;
  readonly title: string;
}): IntervalFeedItemContent {
  const {intervalSeconds, title} = args;

  return {
    feedItemContentType: FeedItemContentType.Interval,
    intervalSeconds,
    title,
  };
}

export function getFeedItemSubtitle(feedItem: FeedItem): string {
  switch (feedItem.feedItemContentType) {
    case FeedItemContentType.Article:
    case FeedItemContentType.Video:
    case FeedItemContentType.Website:
    case FeedItemContentType.Tweet:
    case FeedItemContentType.YouTube:
    case FeedItemContentType.Xkcd:
      return feedItem.content.url;
    case FeedItemContentType.Interval:
      return 'Interval';
    default:
      assertNever(feedItem);
  }
}

export function getFeedItemContentTypeText(feedItemContentType: FeedItemContentType): string {
  switch (feedItemContentType) {
    case FeedItemContentType.Article:
      return 'Article';
    case FeedItemContentType.Video:
      return 'Video';
    case FeedItemContentType.Website:
      return 'Website';
    case FeedItemContentType.Tweet:
      return 'Tweet';
    case FeedItemContentType.YouTube:
      return 'YouTube';
    case FeedItemContentType.Xkcd:
      return 'XKCD';
    case FeedItemContentType.Interval:
      return 'Interval';
    default:
      assertNever(feedItemContentType);
  }
}
