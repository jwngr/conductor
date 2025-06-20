import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {FeedItem, FeedItemId} from '@shared/types/feedItems.types';
import type {Result} from '@shared/types/results.types';

import {FeedItemIdSchema, FeedItemSchema} from '@shared/schemas/feedItems.schema';
import {fromStorageFeedItem} from '@shared/storage/feedItems.storage';

/**
 * Attempts to parse an unknown value into a {@link FeedItemId}.
 */
export function parseFeedItemId(maybeFeedItemId: unknown): Result<FeedItemId, Error> {
  const parsedResult = parseZodResult(FeedItemIdSchema, maybeFeedItemId);
  if (!parsedResult.success) return prefixErrorResult(parsedResult, 'Invalid feed item ID');
  return makeSuccessResult(parsedResult.value as FeedItemId);
}

/**
 * Attempts to parse an unknown value into a {@link FeedItem}.
 */
export function parseFeedItem(maybeFeedItem: unknown): Result<FeedItem, Error> {
  const parsedBaseFeedItemResult = parseZodResult(FeedItemSchema, maybeFeedItem);
  if (!parsedBaseFeedItemResult.success) {
    return prefixErrorResult(parsedBaseFeedItemResult, 'Invalid feed item');
  }

  const feedItemFromStorage = parsedBaseFeedItemResult.value;
  return fromStorageFeedItem(feedItemFromStorage);
}
