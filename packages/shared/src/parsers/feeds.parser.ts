import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {Feed} from '@shared/types/feeds.types';
import type {Result} from '@shared/types/results.types';

import {FeedSchema} from '@shared/schemas/feeds.schema';
import {fromStorageFeed} from '@shared/storage/feeds.storage';

/**
 * Attempts to parse an unknown value into a {@link Feed}.
 */
export function parseFeed(maybeFeed: unknown): Result<Feed, Error> {
  const parsedFeedResult = parseZodResult(FeedSchema, maybeFeed);
  if (!parsedFeedResult.success) {
    return prefixErrorResult(parsedFeedResult, 'Invalid feed');
  }
  const feedFromStorage = parsedFeedResult.value;
  return fromStorageFeed(feedFromStorage);
}
