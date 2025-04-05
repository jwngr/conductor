import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseFeedItemId} from '@shared/parsers/feedItems.parser';

import type {
  ImportQueueItem,
  ImportQueueItemFromStorage,
  ImportQueueItemId,
} from '@shared/types/importQueue.types';
import {
  ImportQueueItemFromStrageSchema,
  ImportQueueItemIdSchema,
} from '@shared/types/importQueue.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';

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
  const parsedImportQueueItemResult = parseZodResult(
    ImportQueueItemFromStrageSchema,
    maybeImportQueueItem
  );
  if (!parsedImportQueueItemResult.success) {
    return prefixErrorResult(parsedImportQueueItemResult, 'Invalid import queue item');
  }

  const parsedImportQueueItemIdResult = parseImportQueueItemId(
    parsedImportQueueItemResult.value.importQueueItemId
  );
  if (!parsedImportQueueItemIdResult.success) return parsedImportQueueItemIdResult;

  const parsedAccountIdResult = parseAccountId(parsedImportQueueItemResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedFeedItemIdResult = parseFeedItemId(parsedImportQueueItemResult.value.feedItemId);
  if (!parsedFeedItemIdResult.success) return parsedFeedItemIdResult;

  return makeSuccessResult({
    importQueueItemId: parsedImportQueueItemIdResult.value,
    accountId: parsedAccountIdResult.value,
    feedItemId: parsedFeedItemIdResult.value,
    url: parsedImportQueueItemResult.value.url,
    status: parsedImportQueueItemResult.value.status,
    createdTime: parseStorageTimestamp(parsedImportQueueItemResult.value.createdTime),
    lastUpdatedTime: parseStorageTimestamp(parsedImportQueueItemResult.value.lastUpdatedTime),
  });
}

/**
 * Converts a {@link ImportQueueItem} to a {@link ImportQueueItemFromStorage} object that can be
 * persisted to Firestore.
 */
export function toStorageImportQueueItem(
  importQueueItem: ImportQueueItem
): ImportQueueItemFromStorage {
  return {
    importQueueItemId: importQueueItem.importQueueItemId,
    accountId: importQueueItem.accountId,
    feedItemId: importQueueItem.feedItemId,
    url: importQueueItem.url,
    status: importQueueItem.status,
    createdTime: importQueueItem.createdTime,
    lastUpdatedTime: importQueueItem.lastUpdatedTime,
  };
}
