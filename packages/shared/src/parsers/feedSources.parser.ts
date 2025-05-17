import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {
  FeedSource,
  FeedSourceFromStorage,
  FeedSourceId,
  IntervalFeedSource,
  IntervalFeedSourceFromStorage,
  RssFeedSource,
  RssFeedSourceFromStorage,
  YouTubeChannelFeedSource,
  YouTubeChannelFeedSourceFromStorage,
} from '@shared/types/feedSources.types';
import {
  FeedSourceFromStorageSchema,
  FeedSourceIdSchema,
  FeedSourceType,
  IntervalFeedSourceSchema,
  RssFeedSourceSchema,
  YouTubeChannelFeedSourceSchema,
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

  return makeSuccessResult({
    type: FeedSourceType.YouTubeChannel,
    feedSourceId: parsedIdResult.value,
    url: parsedFeedSourceResult.value.url,
    title: parsedFeedSourceResult.value.title,
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
    url: parsedFeedSourceResult.value.url,
    title: parsedFeedSourceResult.value.title,
    createdTime: parseStorageTimestamp(parsedFeedSourceResult.value.createdTime),
    lastUpdatedTime: parseStorageTimestamp(parsedFeedSourceResult.value.lastUpdatedTime),
    intervalSeconds: parsedFeedSourceResult.value.intervalSeconds,
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
    default:
      // Fall back to the raw feed source value.
      return feedSource;
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
    url: feedSource.url,
    title: feedSource.title,
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
    url: feedSource.url,
    title: feedSource.title,
    createdTime: feedSource.createdTime,
    lastUpdatedTime: feedSource.lastUpdatedTime,
    intervalSeconds: feedSource.intervalSeconds,
  };
}
