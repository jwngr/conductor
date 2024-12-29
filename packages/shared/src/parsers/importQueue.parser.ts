import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseUserId} from '@shared/parsers/user.parser';

import type {ImportQueueItem, ImportQueueItemId} from '@shared/types/importQueue.types';
import {ImportQueueItemIdSchema, ImportQueueItemSchema} from '@shared/types/importQueue.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {Timestamp} from '@shared/types/utils.types';

/**
 * Parses a {@link ImportQueueItemId} from a plain string. Returns an `ErrorResult` if the string is
 * not valid.
 */
export function parseImportQueueItemId(maybeImportQueueItemId: string): Result<ImportQueueItemId> {
  const parsedResult = parseZodResult(ImportQueueItemIdSchema, maybeImportQueueItemId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid import queue item ID');
  }
  return makeSuccessResult(parsedResult.value as ImportQueueItemId);
}

/**
 * Parses a {@link FeedSource} from an unknown value. Returns an `ErrorResult` if the value is not
 * valid.
 */
export function parseImportQueueItem(maybeImportQueueItem: unknown): Result<ImportQueueItem> {
  const parsedImportQueueItemResult = parseZodResult(ImportQueueItemSchema, maybeImportQueueItem);
  if (!parsedImportQueueItemResult.success) {
    return prefixResultIfError(parsedImportQueueItemResult, 'Invalid import queue item');
  }

  const parsedImportQueueItemIdResult = parseImportQueueItemId(
    parsedImportQueueItemResult.value.importQueueItemId
  );
  if (!parsedImportQueueItemIdResult.success) return parsedImportQueueItemIdResult;

  const parsedUserIdResult = parseUserId(parsedImportQueueItemResult.value.userId);
  if (!parsedUserIdResult.success) return parsedUserIdResult;

  const parsedFeedItemIdResult = parseFeedItemId(parsedImportQueueItemResult.value.feedItemId);
  if (!parsedFeedItemIdResult.success) return parsedFeedItemIdResult;

  const {url, createdTime, lastUpdatedTime} = parsedImportQueueItemResult.value;
  return makeSuccessResult({
    importQueueItemId: parsedImportQueueItemIdResult.value,
    userId: parsedUserIdResult.value,
    feedItemId: parsedFeedItemIdResult.value,
    url,
    status: parsedImportQueueItemResult.value.status,
    createdTime: new Date(createdTime) as unknown as Timestamp,
    lastUpdatedTime: new Date(lastUpdatedTime) as unknown as Timestamp,
  });
}