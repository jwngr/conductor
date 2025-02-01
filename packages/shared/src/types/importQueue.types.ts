import {z} from 'zod';

import {makeUuid} from '@shared/lib/utils.shared';

import {AccountIdSchema} from '@shared/types/accounts.types';
import type {AccountId} from '@shared/types/accounts.types';
import {FeedItemIdSchema} from '@shared/types/feedItems.types';
import type {FeedItemId} from '@shared/types/feedItems.types';
import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {BaseStoreItem, Supplier} from '@shared/types/utils.types';

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
  readonly accountId: AccountId;
  readonly feedItemId: FeedItemId;
  readonly url: string;
  readonly status: ImportQueueItemStatus;
}

/**
 * Zod schema for an {@link ImportQueueItem} persisted to Firestore.
 */
export const ImportQueueItemFromStrageSchema = z.object({
  importQueueItemId: ImportQueueItemIdSchema,
  accountId: AccountIdSchema,
  feedItemId: FeedItemIdSchema,
  url: z.string().url(),
  status: z.nativeEnum(ImportQueueItemStatus),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

/**
 * Type for an {@link ImportQueueItem} persisted to Firestore.
 */
export type ImportQueueItemFromStorage = z.infer<typeof ImportQueueItemFromStrageSchema>;

/**
 * Creates a new {@link ImportQueueItem}.
 */
export function makeImportQueueItem<Timestamp>(
  newItemArgs: Omit<
    ImportQueueItem,
    'importQueueItemId' | 'status' | 'createdTime' | 'lastUpdatedTime'
  >,
  timestampFactory: Supplier<Timestamp>
): Result<ImportQueueItem> {
  return makeSuccessResult({
    importQueueItemId: makeImportQueueItemId(),
    feedItemId: newItemArgs.feedItemId,
    accountId: newItemArgs.accountId,
    url: newItemArgs.url,
    status: ImportQueueItemStatus.New,
    // TODO: This casting is a lie. Can I figure out a way to make this work without casting?
    createdTime: timestampFactory() as Date,
    lastUpdatedTime: timestampFactory() as Date,
  });
}
