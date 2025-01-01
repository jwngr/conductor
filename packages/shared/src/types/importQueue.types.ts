import {z} from 'zod';

import {makeUuid} from '@shared/lib/utils.shared';

import {FeedItemIdSchema} from '@shared/types/feedItems.types';
import type {FeedItemId} from '@shared/types/feedItems.types';
import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import {UserIdSchema} from '@shared/types/user.types';
import type {UserId} from '@shared/types/user.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Strongly-typed type for an {@link ImportQueueItem}'s unique identifier. Prefer this over plain
 * strings.
 */
export type ImportQueueItemId = string & {readonly __brand: 'ImportQueueItemIdBrand'};

/**
 * Zod schema for an {@link ImportQueueItemId}.
 */
export const ImportQueueItemIdSchema = z.string().uuid();

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

/**
 * Zod schema for an {@link ImportQueueItem}.
 */
export const ImportQueueItemSchema = z.object({
  importQueueItemId: ImportQueueItemIdSchema,
  userId: UserIdSchema,
  feedItemId: FeedItemIdSchema,
  url: z.string().url(),
  status: z.nativeEnum(ImportQueueItemStatus),
  createdTime: FirestoreTimestampSchema,
  lastUpdatedTime: FirestoreTimestampSchema,
});

export type ImportQueueItemFromSchema = z.infer<typeof ImportQueueItemSchema>;

/**
 * Creates a new {@link ImportQueueItem}.
 */
export function makeImportQueueItem(
  args: Omit<ImportQueueItem, 'importQueueItemId' | 'status' | 'createdTime' | 'lastUpdatedTime'>
): Result<ImportQueueItem> {
  const {feedItemId, userId, url} = args;

  return makeSuccessResult({
    importQueueItemId: makeImportQueueItemId(),
    feedItemId,
    userId,
    url,
    status: ImportQueueItemStatus.New,
      // TODO: Should use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  });
}
