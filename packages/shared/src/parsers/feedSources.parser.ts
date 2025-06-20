import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {FeedSource} from '@shared/types/feedSources.types';
import type {Result} from '@shared/types/results.types';

import {FeedSourceSchema} from '@shared/schemas/feedSources.schema';
import {fromStorageFeedSource} from '@shared/storage/feedSources.storage';

/**
 * Attempts to parse an unknown value into a {@link FeedSource}.
 */
export function parseFeedSource(maybeFeedSource: unknown): Result<FeedSource, Error> {
  const parsedFeedSourceResult = parseZodResult(FeedSourceSchema, maybeFeedSource);
  if (!parsedFeedSourceResult.success) {
    return prefixErrorResult(parsedFeedSourceResult, 'Invalid feed source');
  }
  const feedSourceFromStorage = parsedFeedSourceResult.value;
  return fromStorageFeedSource(feedSourceFromStorage);
}
