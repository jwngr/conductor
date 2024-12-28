import {z} from 'zod';

import {
  parseZodResult,
  prefixErrorResult,
  prefixResultIfError,
} from '@shared/lib/errorUtils.shared';
import {makeUuid} from '@shared/lib/utils.shared';

import {parseFeedItemId} from '@shared/parsers/feedItems.parser';

import {FeedItemIdSchema} from '@shared/types/feedItems.types';
import type {FeedItemId} from '@shared/types/feedItems.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import {parseUserId, UserIdSchema} from '@shared/types/user.types';
import type {UserId} from '@shared/types/user.types';
import type {BaseStoreItem, Timestamp} from '@shared/types/utils.types';

/**
 * Strongly-typed type for an {@link ImportQueueItem}'s unique identifier. Prefer this over plain
 * strings.
 */
export type ImportQueueItemId = string & {readonly __brand: 'ImportQueueItemIdBrand'};

export const ImportQueueItemIdSchema = z.string().uuid();

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
 * Creates a new random {@link ImportQueueItemId}.
 */
export function makeImportQueueItemId(): ImportQueueItemId {
  return makeUuid<ImportQueueItemId>();
}

/**
 * The import status of an import queue item.
 */
export enum ImportQueueItemStatus {
  /**
   * The item has been created but not yet processed.
   */
  New = 'NEW',
  /**
   * The item is currently being processed.
   */
  Processing = 'PROCESSING',
  /**
   * The item failed to be processed.
   */
  Failed = 'FAILED',
  // Note: There is no "completed" status because items are deleted once complete.
}

export const ImportQueueItemSchema = z.object({
  importQueueItemId: ImportQueueItemIdSchema,
  userId: UserIdSchema,
  feedItemId: FeedItemIdSchema,
  url: z.string().url(),
  status: z.nativeEnum(ImportQueueItemStatus),
  createdTime: z.date(),
  lastUpdatedTime: z.date(),
});

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

/**
 * An item in the feed import queue.
 */
export interface ImportQueueItem extends BaseStoreItem {
  readonly importQueueItemId: ImportQueueItemId;
  readonly userId: UserId;
  readonly feedItemId: FeedItemId;
  readonly url: string;
  readonly status: ImportQueueItemStatus;
}

export function makeImportQueueItem(args: {
  readonly feedItemId: FeedItemId;
  readonly userId: UserId;
  readonly url: string;
  readonly createdTime: Timestamp;
  readonly lastUpdatedTime: Timestamp;
}): Result<ImportQueueItem> {
  const {feedItemId, userId, url, createdTime, lastUpdatedTime} = args;

  const importQueueItemId = makeImportQueueItemId();

  return makeSuccessResult({
    importQueueItemId,
    feedItemId,
    userId,
    url,
    status: ImportQueueItemStatus.New,
    createdTime,
    lastUpdatedTime,
  });
}
