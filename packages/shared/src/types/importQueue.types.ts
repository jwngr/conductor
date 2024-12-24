import {makeId} from '@shared/lib/utils';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Strongly-typed type for an {@link ImportQueueItem}'s unique identifier. Prefer this over plain
 * strings.
 */
export type ImportQueueItemId = string & {readonly __brand: 'ImportQueueItemIdBrand'};

/**
 * Checks if a value is a valid {@link ImportQueueItemId}.
 */
export function isImportQueueItemId(
  maybeImportQueueItemId: unknown
): maybeImportQueueItemId is ImportQueueItemId {
  return typeof maybeImportQueueItemId === 'string' && maybeImportQueueItemId.length > 0;
}

/**
 * Creates an {@link ImportQueueItemId} from a plain string. Returns an error if the string is not
 * valid.
 */
export function makeImportQueueItemId(
  maybeImportQueueItemId: string = makeId()
): Result<ImportQueueItemId> {
  if (!isImportQueueItemId(maybeImportQueueItemId)) {
    return makeErrorResult(new Error(`Invalid import queue item ID: "${maybeImportQueueItemId}"`));
  }
  return makeSuccessResult(maybeImportQueueItemId);
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
