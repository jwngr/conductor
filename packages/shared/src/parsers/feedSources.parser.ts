import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import {parseYouTubeChannelId} from '@shared/parsers/youtube.parser';

import type {
  FeedSource,
  FeedSourceFromStorage,
  FeedSourceId,
  IntervalFeedSource,
  IntervalFeedSourceFromStorage,
  IntervalMiniFeedSource,
  IntervalMiniFeedSourceFromStorage,
  MiniFeedSource,
  MiniFeedSourceFromStorage,
  RssFeedSource,
  RssFeedSourceFromStorage,
  RssMiniFeedSource,
  RssMiniFeedSourceFromStorage,
  YouTubeChannelFeedSource,
  YouTubeChannelFeedSourceFromStorage,
  YouTubeChannelMiniFeedSource,
  YouTubeChannelMiniFeedSourceFromStorage,
} from '@shared/types/feedSources.types';
import {
  EXTENSION_FEED_SOURCE,
  FeedSourceFromStorageSchema,
  FeedSourceIdSchema,
  FeedSourceType,
  IntervalFeedSourceSchema,
  IntervalMiniFeedSourceSchema,
  MiniFeedSourceFromStorageSchema,
  POCKET_EXPORT_FEED_SOURCE,
  PWA_FEED_SOURCE,
  RssFeedSourceSchema,
  RssMiniFeedSourceSchema,
  YouTubeChannelFeedSourceSchema,
  YouTubeChannelMiniFeedSourceSchema,
} from '@shared/types/feedSources.types';
import type {Result} from '@shared/types/results.types';

/**
 * Parses a {@link FeedSourceId} from a plain string. Returns an `ErrorResult` if the string is not
 * valid.
 */
export function parseFeedSourceId(maybeFeedSourceId: string): Result<FeedSourceId> {
  const parsedResult = parseZodResult(FeedSourceIdSchema, maybeFeedSourceId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid feed source ID');
  }
  return makeSuccessResult(parsedResult.value as FeedSourceId);
}

/**
 * Parses a {@link FeedSource} from an unknown value. Returns an `ErrorResult` if the value is not
 * valid.
 */
export function parseFeedSource(maybeFeedSource: unknown): Result<FeedSource> {
  const parsedFeedSourceResult = parseZodResult(FeedSourceFromStorageSchema, maybeFeedSource);
  if (!parsedFeedSourceResult.success) {
    return prefixErrorResult(parsedFeedSourceResult, 'Invalid feed source');
  }

  switch (parsedFeedSourceResult.value.type) {
    case FeedSourceType.PWA:
      return makeSuccessResult(PWA_FEED_SOURCE);
    case FeedSourceType.Extension:
      return makeSuccessResult(EXTENSION_FEED_SOURCE);
    case FeedSourceType.PocketExport:
      return makeSuccessResult(POCKET_EXPORT_FEED_SOURCE);
    case FeedSourceType.Interval:
      return parseIntervalFeedSource(parsedFeedSourceResult.value);
    case FeedSourceType.RSS:
      return parseRssFeedSource(parsedFeedSourceResult.value);
    case FeedSourceType.YouTubeChannel:
      return parseYouTubeChannelFeedSource(parsedFeedSourceResult.value);
    default:
      return makeErrorResult(new Error('Invalid feed source type'));
  }
}

function parseRssFeedSource(maybeFeedSource: unknown): Result<RssFeedSource> {
  const parsedFeedSourceResult = parseZodResult(RssFeedSourceSchema, maybeFeedSource);
  if (!parsedFeedSourceResult.success) {
    return prefixErrorResult(parsedFeedSourceResult, 'Invalid feed source');
  }

  const parsedIdResult = parseFeedSourceId(parsedFeedSourceResult.value.feedSourceId);
  if (!parsedIdResult.success) return parsedIdResult;

  return makeSuccessResult({
    type: FeedSourceType.RSS,
    feedSourceId: parsedIdResult.value,
    url: parsedFeedSourceResult.value.url,
    title: parsedFeedSourceResult.value.title,
    createdTime: parseStorageTimestamp(parsedFeedSourceResult.value.createdTime),
    lastUpdatedTime: parseStorageTimestamp(parsedFeedSourceResult.value.lastUpdatedTime),
  });
}

function parseYouTubeChannelFeedSource(maybeFeedSource: unknown): Result<YouTubeChannelFeedSource> {
  const parsedFeedSourceResult = parseZodResult(YouTubeChannelFeedSourceSchema, maybeFeedSource);
  if (!parsedFeedSourceResult.success) {
    return prefixErrorResult(parsedFeedSourceResult, 'Invalid feed source');
  }

  const parsedIdResult = parseFeedSourceId(parsedFeedSourceResult.value.feedSourceId);
  if (!parsedIdResult.success) return parsedIdResult;

  const parsedChannelIdResult = parseYouTubeChannelId(parsedFeedSourceResult.value.channelId);
  if (!parsedChannelIdResult.success) return parsedChannelIdResult;

  return makeSuccessResult({
    type: FeedSourceType.YouTubeChannel,
    feedSourceId: parsedIdResult.value,
    channelId: parsedChannelIdResult.value,
    createdTime: parseStorageTimestamp(parsedFeedSourceResult.value.createdTime),
    lastUpdatedTime: parseStorageTimestamp(parsedFeedSourceResult.value.lastUpdatedTime),
  });
}

function parseIntervalFeedSource(maybeFeedSource: unknown): Result<IntervalFeedSource> {
  const parsedFeedSourceResult = parseZodResult(IntervalFeedSourceSchema, maybeFeedSource);
  if (!parsedFeedSourceResult.success) {
    return prefixErrorResult(parsedFeedSourceResult, 'Invalid feed source');
  }

  const parsedIdResult = parseFeedSourceId(parsedFeedSourceResult.value.feedSourceId);
  if (!parsedIdResult.success) return parsedIdResult;

  return makeSuccessResult({
    type: FeedSourceType.Interval,
    feedSourceId: parsedIdResult.value,
    intervalSeconds: parsedFeedSourceResult.value.intervalSeconds,
    createdTime: parseStorageTimestamp(parsedFeedSourceResult.value.createdTime),
    lastUpdatedTime: parseStorageTimestamp(parsedFeedSourceResult.value.lastUpdatedTime),
  });
}

/**
 * Converts a {@link FeedSource} to a {@link FeedSourceFromStorage} object that can be persisted to
 * Firestore.
 */
export function toStorageFeedSource(feedSource: FeedSource): FeedSourceFromStorage {
  switch (feedSource.type) {
    case FeedSourceType.Interval:
      return toStorageIntervalFeedSource(feedSource);
    case FeedSourceType.RSS:
      return toStorageRssFeedSource(feedSource);
    case FeedSourceType.YouTubeChannel:
      return toStorageYouTubeChannelFeedSource(feedSource);
    case FeedSourceType.PWA:
      return PWA_FEED_SOURCE;
    case FeedSourceType.Extension:
      return EXTENSION_FEED_SOURCE;
    case FeedSourceType.PocketExport:
      return POCKET_EXPORT_FEED_SOURCE;
    default:
      // Fall back to the PWA as a feed source.
      return PWA_FEED_SOURCE;
  }
}

function toStorageRssFeedSource(feedSource: RssFeedSource): RssFeedSourceFromStorage {
  return {
    type: FeedSourceType.RSS,
    feedSourceId: feedSource.feedSourceId,
    url: feedSource.url,
    title: feedSource.title,
    createdTime: feedSource.createdTime,
    lastUpdatedTime: feedSource.lastUpdatedTime,
  };
}

function toStorageYouTubeChannelFeedSource(
  feedSource: YouTubeChannelFeedSource
): YouTubeChannelFeedSourceFromStorage {
  return {
    type: FeedSourceType.YouTubeChannel,
    feedSourceId: feedSource.feedSourceId,
    channelId: feedSource.channelId,
    createdTime: feedSource.createdTime,
    lastUpdatedTime: feedSource.lastUpdatedTime,
  };
}

function toStorageIntervalFeedSource(
  feedSource: IntervalFeedSource
): IntervalFeedSourceFromStorage {
  return {
    type: FeedSourceType.Interval,
    feedSourceId: feedSource.feedSourceId,
    intervalSeconds: feedSource.intervalSeconds,
    createdTime: feedSource.createdTime,
    lastUpdatedTime: feedSource.lastUpdatedTime,
  };
}

//////////////////////////////
//  MiniFeedSource parsers  //
//////////////////////////////

/**
 * Parses a {@link FeedSource} from an unknown value. Returns an `ErrorResult` if the value is not
 * valid.
 */
export function parseMiniFeedSource(maybeMiniFeedSource: unknown): Result<MiniFeedSource> {
  const parsedMiniFeedSourceResult = parseZodResult(
    MiniFeedSourceFromStorageSchema,
    maybeMiniFeedSource
  );
  if (!parsedMiniFeedSourceResult.success) {
    return prefixErrorResult(parsedMiniFeedSourceResult, 'Invalid mini feed source');
  }

  switch (parsedMiniFeedSourceResult.value.type) {
    case FeedSourceType.PWA:
      return makeSuccessResult(PWA_FEED_SOURCE);
    case FeedSourceType.Extension:
      return makeSuccessResult(EXTENSION_FEED_SOURCE);
    case FeedSourceType.PocketExport:
      return makeSuccessResult(POCKET_EXPORT_FEED_SOURCE);
    case FeedSourceType.Interval:
      return parseIntervalMiniFeedSource(parsedMiniFeedSourceResult.value);
    case FeedSourceType.RSS:
      return parseRssMiniFeedSource(parsedMiniFeedSourceResult.value);
    case FeedSourceType.YouTubeChannel:
      return parseYouTubeChannelMiniFeedSource(parsedMiniFeedSourceResult.value);
    default:
      return makeErrorResult(new Error('Invalid feed source type'));
  }
}

export function parseRssMiniFeedSource(maybeRssMiniFeedSource: unknown): Result<RssMiniFeedSource> {
  const parsedMiniFeedSourceResult = parseZodResult(
    RssMiniFeedSourceSchema,
    maybeRssMiniFeedSource
  );
  if (!parsedMiniFeedSourceResult.success) {
    return prefixErrorResult(parsedMiniFeedSourceResult, 'Invalid persisted mini feed source');
  }

  const parsedIdResult = parseFeedSourceId(parsedMiniFeedSourceResult.value.feedSourceId);
  if (!parsedIdResult.success) return parsedIdResult;

  return makeSuccessResult({
    type: FeedSourceType.RSS,
    feedSourceId: parsedIdResult.value,
    url: parsedMiniFeedSourceResult.value.url,
    title: parsedMiniFeedSourceResult.value.title,
  });
}

export function parseYouTubeChannelMiniFeedSource(
  maybeYouTubeChannelMiniFeedSource: unknown
): Result<YouTubeChannelMiniFeedSource> {
  const parsedMiniFeedSourceResult = parseZodResult(
    YouTubeChannelMiniFeedSourceSchema,
    maybeYouTubeChannelMiniFeedSource
  );
  if (!parsedMiniFeedSourceResult.success) {
    return prefixErrorResult(parsedMiniFeedSourceResult, 'Invalid persisted mini feed source');
  }

  const parsedFeedSourceIdResult = parseFeedSourceId(parsedMiniFeedSourceResult.value.feedSourceId);
  if (!parsedFeedSourceIdResult.success) return parsedFeedSourceIdResult;

  const parsedChannelIdResult = parseYouTubeChannelId(parsedMiniFeedSourceResult.value.channelId);
  if (!parsedChannelIdResult.success) return parsedChannelIdResult;

  return makeSuccessResult({
    type: FeedSourceType.YouTubeChannel,
    feedSourceId: parsedFeedSourceIdResult.value,
    channelId: parsedChannelIdResult.value,
  });
}

export function parseIntervalMiniFeedSource(
  maybeIntervalMiniFeedSource: unknown
): Result<IntervalMiniFeedSource> {
  const parsedMiniFeedSourceResult = parseZodResult(
    IntervalMiniFeedSourceSchema,
    maybeIntervalMiniFeedSource
  );
  if (!parsedMiniFeedSourceResult.success) {
    return prefixErrorResult(parsedMiniFeedSourceResult, 'Invalid persisted mini feed source');
  }

  const parsedFeedSourceIdResult = parseFeedSourceId(parsedMiniFeedSourceResult.value.feedSourceId);
  if (!parsedFeedSourceIdResult.success) return parsedFeedSourceIdResult;

  return makeSuccessResult({
    type: FeedSourceType.Interval,
    feedSourceId: parsedFeedSourceIdResult.value,
    intervalSeconds: parsedMiniFeedSourceResult.value.intervalSeconds,
  });
}

/**
 * Converts a {@link FeedSource} to a {@link FeedSourceFromStorage} object that can be persisted to
 * Firestore.
 */
export function toStorageMiniFeedSource(feedSource: MiniFeedSource): MiniFeedSourceFromStorage {
  switch (feedSource.type) {
    case FeedSourceType.Interval:
      return toStorageIntervalMiniFeedSource(feedSource);
    case FeedSourceType.RSS:
      return toStorageRssMiniFeedSource(feedSource);
    case FeedSourceType.YouTubeChannel:
      return toStorageYouTubeChannelMiniFeedSource(feedSource);
    case FeedSourceType.PWA:
      return PWA_FEED_SOURCE;
    case FeedSourceType.Extension:
      return EXTENSION_FEED_SOURCE;
    case FeedSourceType.PocketExport:
      return POCKET_EXPORT_FEED_SOURCE;
    default:
      // Fall back to the PWA as a feed source.
      return PWA_FEED_SOURCE;
  }
}

function toStorageRssMiniFeedSource(feedSource: RssMiniFeedSource): RssMiniFeedSourceFromStorage {
  return {
    type: FeedSourceType.RSS,
    feedSourceId: feedSource.feedSourceId,
    url: feedSource.url,
    title: feedSource.title,
  };
}

function toStorageYouTubeChannelMiniFeedSource(
  feedSource: YouTubeChannelMiniFeedSource
): YouTubeChannelMiniFeedSourceFromStorage {
  return {
    type: FeedSourceType.YouTubeChannel,
    feedSourceId: feedSource.feedSourceId,
    channelId: feedSource.channelId,
  };
}

function toStorageIntervalMiniFeedSource(
  feedSource: IntervalMiniFeedSource
): IntervalMiniFeedSourceFromStorage {
  return {
    type: FeedSourceType.Interval,
    feedSourceId: feedSource.feedSourceId,
  };
}
