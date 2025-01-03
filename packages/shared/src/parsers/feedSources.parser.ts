import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {
  parseFirestoreTimestamp,
  parseZodResult,
  toFirestoreTimestamp,
} from '@shared/lib/parser.shared';

import type {FeedSource, FeedSourceFromSchema, FeedSourceId} from '@shared/types/feedSources.types';
import {FeedSourceIdSchema, FeedSourceSchema} from '@shared/types/feedSources.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';

/**
 * Parses a {@link FeedSourceId} from a plain string. Returns an `ErrorResult` if the string is not
 * valid.
 */
export function parseFeedSourceId(maybeFeedSourceId: string): Result<FeedSourceId> {
  const parsedResult = parseZodResult(FeedSourceIdSchema, maybeFeedSourceId);
  if (!parsedResult.success) {
    return prefixResultIfError(parsedResult, 'Invalid feed source ID');
  }
  return makeSuccessResult(parsedResult.value as FeedSourceId);
}

/**
 * Parses a {@link FeedSource} from an unknown value. Returns an `ErrorResult` if the value is not
 * valid.
 */
export function parseFeedSource(maybeFeedSource: unknown): Result<FeedSource> {
  const parsedFeedSourceResult = parseZodResult(FeedSourceSchema, maybeFeedSource);
  if (!parsedFeedSourceResult.success) {
    return prefixResultIfError(parsedFeedSourceResult, 'Invalid feed source');
  }

  const parsedIdResult = parseFeedSourceId(parsedFeedSourceResult.value.feedSourceId);
  if (!parsedIdResult.success) return parsedIdResult;

  return makeSuccessResult({
    feedSourceId: parsedIdResult.value,
    url: parsedFeedSourceResult.value.url,
    title: parsedFeedSourceResult.value.title,
    createdTime: parseFirestoreTimestamp(parsedFeedSourceResult.value.createdTime),
    lastUpdatedTime: parseFirestoreTimestamp(parsedFeedSourceResult.value.lastUpdatedTime),
  });
}

export function toFirestoreFeedSource(feedSource: FeedSource): FeedSourceFromSchema {
  return {
    feedSourceId: feedSource.feedSourceId,
    url: feedSource.url,
    title: feedSource.title,
    createdTime: toFirestoreTimestamp(feedSource.createdTime),
    lastUpdatedTime: toFirestoreTimestamp(feedSource.lastUpdatedTime),
  };
}
