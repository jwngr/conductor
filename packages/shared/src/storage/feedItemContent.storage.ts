import {makeSuccessResult} from '@shared/lib/results.shared';

import type {
  ArticleFeedItemContent,
  IntervalFeedItemContent,
  TweetFeedItemContent,
  VideoFeedItemContent,
  WebsiteFeedItemContent,
  XkcdFeedItemContent,
  YouTubeFeedItemContent,
} from '@shared/types/feedItemContent.types';
import {FeedItemContentType} from '@shared/types/feedItemContent.types';
import type {Result} from '@shared/types/results.types';

import type {
  ArticleFeedItemContentFromStorage,
  IntervalFeedItemContentFromStorage,
  TweetFeedItemContentFromStorage,
  VideoFeedItemContentFromStorage,
  WebsiteFeedItemContentFromStorage,
  XkcdFeedItemContentFromStorage,
  YouTubeFeedItemContentFromStorage,
} from '@shared/schemas/feedItemContent.schema';

export function toStorageArticleFeedItemContent(
  feedItemContent: ArticleFeedItemContent
): ArticleFeedItemContentFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Article,
    title: feedItemContent.title,
    url: feedItemContent.url,
    description: feedItemContent.description,
    summary: feedItemContent.summary,
    outgoingLinks: feedItemContent.outgoingLinks,
  };
}

export function toStorageVideoFeedItemContent(
  feedItemContent: VideoFeedItemContent
): VideoFeedItemContentFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Video,
    title: feedItemContent.title,
    url: feedItemContent.url,
    description: feedItemContent.description,
    summary: feedItemContent.summary,
    outgoingLinks: feedItemContent.outgoingLinks,
  };
}

export function toStorageWebsiteFeedItemContent(
  feedItemContent: WebsiteFeedItemContent
): WebsiteFeedItemContentFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Website,
    title: feedItemContent.title,
    url: feedItemContent.url,
    description: feedItemContent.description,
    summary: feedItemContent.summary,
    outgoingLinks: feedItemContent.outgoingLinks,
  };
}

export function toStorageTweetFeedItemContent(
  feedItemContent: TweetFeedItemContent
): TweetFeedItemContentFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Tweet,
    title: feedItemContent.title,
    url: feedItemContent.url,
    description: feedItemContent.description,
    summary: feedItemContent.summary,
    outgoingLinks: feedItemContent.outgoingLinks,
  };
}

export function toStorageYouTubeFeedItemContent(
  feedItemContent: YouTubeFeedItemContent
): YouTubeFeedItemContentFromStorage {
  return {
    feedItemContentType: FeedItemContentType.YouTube,
    title: feedItemContent.title,
    url: feedItemContent.url,
    description: feedItemContent.description,
    summary: feedItemContent.summary,
    outgoingLinks: feedItemContent.outgoingLinks,
  };
}

export function toStorageXkcdFeedItemContent(
  feedItemContent: XkcdFeedItemContent
): XkcdFeedItemContentFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Xkcd,
    title: feedItemContent.title,
    url: feedItemContent.url,
    summary: feedItemContent.summary,
    altText: feedItemContent.altText,
    imageUrlSmall: feedItemContent.imageUrlSmall,
    imageUrlLarge: feedItemContent.imageUrlLarge,
  };
}

export function toStorageIntervalFeedItemContent(
  feedItemContent: IntervalFeedItemContent
): IntervalFeedItemContentFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Interval,
    title: feedItemContent.title,
    intervalSeconds: feedItemContent.intervalSeconds,
  };
}

export function fromStorageArticleFeedItemContent(
  feedItemContentFromStorage: ArticleFeedItemContentFromStorage
): Result<ArticleFeedItemContent, Error> {
  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Article,
    title: feedItemContentFromStorage.title,
    url: feedItemContentFromStorage.url,
    description: feedItemContentFromStorage.description,
    summary: feedItemContentFromStorage.summary,
    outgoingLinks: feedItemContentFromStorage.outgoingLinks,
  });
}

export function fromStorageVideoFeedItemContent(
  feedItemContentFromStorage: VideoFeedItemContentFromStorage
): Result<VideoFeedItemContent, Error> {
  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Video,
    title: feedItemContentFromStorage.title,
    url: feedItemContentFromStorage.url,
    description: feedItemContentFromStorage.description,
    summary: feedItemContentFromStorage.summary,
    outgoingLinks: feedItemContentFromStorage.outgoingLinks,
  });
}

export function fromStorageWebsiteFeedItemContent(
  feedItemContentFromStorage: WebsiteFeedItemContentFromStorage
): Result<WebsiteFeedItemContent, Error> {
  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Website,
    title: feedItemContentFromStorage.title,
    url: feedItemContentFromStorage.url,
    description: feedItemContentFromStorage.description,
    summary: feedItemContentFromStorage.summary,
    outgoingLinks: feedItemContentFromStorage.outgoingLinks,
  });
}

export function fromStorageTweetFeedItemContent(
  feedItemContentFromStorage: TweetFeedItemContentFromStorage
): Result<TweetFeedItemContent, Error> {
  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Tweet,
    title: feedItemContentFromStorage.title,
    url: feedItemContentFromStorage.url,
    description: feedItemContentFromStorage.description,
    summary: feedItemContentFromStorage.summary,
    outgoingLinks: feedItemContentFromStorage.outgoingLinks,
  });
}

export function fromStorageYouTubeFeedItemContent(
  feedItemContentFromStorage: YouTubeFeedItemContentFromStorage
): Result<YouTubeFeedItemContent, Error> {
  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.YouTube,
    title: feedItemContentFromStorage.title,
    url: feedItemContentFromStorage.url,
    description: feedItemContentFromStorage.description,
    summary: feedItemContentFromStorage.summary,
    outgoingLinks: feedItemContentFromStorage.outgoingLinks,
  });
}

export function fromStorageXkcdFeedItemContent(
  feedItemContentFromStorage: XkcdFeedItemContentFromStorage
): Result<XkcdFeedItemContent, Error> {
  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Xkcd,
    title: feedItemContentFromStorage.title,
    url: feedItemContentFromStorage.url,
    summary: feedItemContentFromStorage.summary,
    altText: feedItemContentFromStorage.altText,
    imageUrlSmall: feedItemContentFromStorage.imageUrlSmall,
    imageUrlLarge: feedItemContentFromStorage.imageUrlLarge,
  });
}

export function fromStorageIntervalFeedItemContent(
  feedItemContentFromStorage: IntervalFeedItemContentFromStorage
): Result<IntervalFeedItemContent, Error> {
  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Interval,
    title: feedItemContentFromStorage.title,
    intervalSeconds: feedItemContentFromStorage.intervalSeconds,
  });
}
