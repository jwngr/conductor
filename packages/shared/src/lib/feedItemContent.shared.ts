import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult, syncTry} from '@shared/lib/errorUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';
import {isXkcdComicUrl} from '@shared/lib/xkcd.shared';
import {isYouTubeVideoUrl} from '@shared/lib/youtube.shared';

import {FeedItemContentType} from '@shared/types/feedItemContent.types';
import type {
  ArticleFeedItemContent,
  FeedItemContent,
  IntervalFeedItemContent,
  TweetFeedItemContent,
  VideoFeedItemContent,
  WebsiteFeedItemContent,
  XkcdFeedItemContent,
  YouTubeFeedItemContent,
} from '@shared/types/feedItemContent.types';
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
  readonly summary: string | null;
}): Exclude<FeedItemContent, FeedItemContentType.Interval> {
  const {url, title, description, summary} = args;

  const feedItemContentType = getFeedItemContentTypeFromUrl(url);

  switch (feedItemContentType) {
    case FeedItemContentType.Article:
      return makeArticleFeedItemContent({url, title, description, summary});
    case FeedItemContentType.Video:
      return makeVideoFeedItemContent({url, title, description, summary});
    case FeedItemContentType.Website:
      return makeWebsiteFeedItemContent({url, title, description, summary});
    case FeedItemContentType.Tweet:
      return makeTweetFeedItemContent({url, title, description, summary});
    case FeedItemContentType.YouTube:
      return makeYouTubeFeedItemContent({url, title, description, summary});
    case FeedItemContentType.Xkcd:
      return makeXkcdFeedItemContent({url, title, summary});
    default:
      assertNever(feedItemContentType);
  }
}

export function makeArticleFeedItemContent(
  args: Pick<ArticleFeedItemContent, 'url' | 'title' | 'description' | 'summary'>
): ArticleFeedItemContent {
  const {url, title, description, summary} = args;

  return {
    feedItemContentType: FeedItemContentType.Article,
    url,
    title,
    description,
    summary,
  };
}

export function makeVideoFeedItemContent(
  args: Pick<VideoFeedItemContent, 'url' | 'title' | 'description' | 'summary'>
): VideoFeedItemContent {
  const {url, title, description, summary} = args;

  return {
    feedItemContentType: FeedItemContentType.Video,
    url,
    title,
    description,
    summary,
  };
}

export function makeWebsiteFeedItemContent(
  args: Pick<WebsiteFeedItemContent, 'url' | 'title' | 'description' | 'summary'>
): WebsiteFeedItemContent {
  const {url, title, description, summary} = args;

  return {
    feedItemContentType: FeedItemContentType.Website,
    url,
    title,
    description,
    summary,
  };
}

export function makeTweetFeedItemContent(
  args: Pick<TweetFeedItemContent, 'url' | 'title' | 'description' | 'summary'>
): TweetFeedItemContent {
  const {url, title, description, summary} = args;

  return {
    feedItemContentType: FeedItemContentType.Tweet,
    url,
    title,
    description,
    summary,
  };
}

export function makeYouTubeFeedItemContent(
  args: Pick<YouTubeFeedItemContent, 'url' | 'title' | 'description' | 'summary'>
): YouTubeFeedItemContent {
  const {url, title, description, summary} = args;

  return {
    feedItemContentType: FeedItemContentType.YouTube,
    url,
    title,
    description,
    summary,
  };
}

export function makeXkcdFeedItemContent(
  args: Pick<XkcdFeedItemContent, 'url' | 'title' | 'summary'>
): XkcdFeedItemContent {
  const {url, title, summary} = args;

  return {
    feedItemContentType: FeedItemContentType.Xkcd,
    url,
    title,
    summary,
    // Remaining fields will be filled in by import.
    altText: '',
    imageUrlSmall: '',
    imageUrlLarge: '',
  };
}

export function makeIntervalFeedItemContent(
  args: Pick<IntervalFeedItemContent, 'intervalSeconds' | 'title'>
): IntervalFeedItemContent {
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
