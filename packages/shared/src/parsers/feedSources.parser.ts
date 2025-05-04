import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {
  FeedSource,
  FeedSourceFromStorage,
  FeedSourceId,
} from '@shared/types/feedSources.types';
import {FeedSourceFromStorageSchema, FeedSourceIdSchema} from '@shared/types/feedSources.types';
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

  const parsedIdResult = parseFeedSourceId(parsedFeedSourceResult.value.feedSourceId);
  if (!parsedIdResult.success) return parsedIdResult;

  return makeSuccessResult({
    feedSourceId: parsedIdResult.value,
    url: parsedFeedSourceResult.value.url,
    title: parsedFeedSourceResult.value.title,
    createdTime: parseStorageTimestamp(parsedFeedSourceResult.value.createdTime),
    lastUpdatedTime: parseStorageTimestamp(parsedFeedSourceResult.value.lastUpdatedTime),
  });
}

/**
 * Converts a {@link FeedSource} to a {@link FeedSourceFromStorage} object that can be persisted to
 * Firestore.
 */
export function toStorageFeedSource(feedSource: FeedSource): FeedSourceFromStorage {
  return {
    feedSourceId: feedSource.feedSourceId,
    url: feedSource.url,
    title: feedSource.title,
    createdTime: feedSource.createdTime,
    lastUpdatedTime: feedSource.lastUpdatedTime,
  };
}
