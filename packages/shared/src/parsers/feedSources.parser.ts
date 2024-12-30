import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';

import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {FeedSource, FeedSourceId} from '@shared/types/feedSources.types';
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

  const {url, title, createdTime, lastUpdatedTime} = parsedFeedSourceResult.value;
  return makeSuccessResult({
    feedSourceId: parsedIdResult.value,
    url,
    title,
    createdTime: createdTime.toDate(),
    lastUpdatedTime: lastUpdatedTime.toDate(),
  });
}

export const feedSourceFirestoreConverter: FirestoreDataConverter<FeedSource> = {
  toFirestore(feedSource: FeedSource): DocumentData {
    return {
      feedSourceId: feedSource.feedSourceId,
      url: feedSource.url,
      title: feedSource.title,
      createdTime: feedSource.createdTime,
      lastUpdatedTime: feedSource.lastUpdatedTime,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): FeedSource {
    const data = snapshot.data(options);
    if (!data) throw new Error('Feed source document data is null');
    const parseResult = parseFeedSource(data);
    if (!parseResult.success) throw parseResult.error;
    return parseResult.value;
  },
};
