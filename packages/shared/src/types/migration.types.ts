/**
 * External migration items are items that are being imported from an external source to become
 * {@link FeedItem}s. The `FeedItem` itself maintains separate state for enriching the item via
 * scraping and AI.
 */

import type {FeedItem} from '@shared/types/feedItems.types';

export enum ExternalMigrationItemStatus {
  NotStarted = 'NOT_STARTED',
  CreatingFeedItem = 'CREATING_FEED_ITEM',
  FeedItemExists = 'FEED_ITEM_EXISTS',
  Failed = 'FAILED',
}

interface BaseExternalMigrationItemState {
  readonly status: ExternalMigrationItemStatus;
}

interface NotStartedExternalMigrationItemState extends BaseExternalMigrationItemState {
  readonly status: ExternalMigrationItemStatus.NotStarted;
}

export const NOT_STARTED_EXTERNAL_MIGRATION_ITEM_STATE: NotStartedExternalMigrationItemState = {
  status: ExternalMigrationItemStatus.NotStarted,
};

interface ProcessingExternalMigrationItemState extends BaseExternalMigrationItemState {
  readonly status: ExternalMigrationItemStatus.CreatingFeedItem;
}

export const PROCESSING_EXTERNAL_MIGRATION_ITEM_STATE: ProcessingExternalMigrationItemState = {
  status: ExternalMigrationItemStatus.CreatingFeedItem,
};

interface ImportedExternalMigrationItemState extends BaseExternalMigrationItemState {
  readonly status: ExternalMigrationItemStatus.FeedItemExists;
  readonly feedItem: FeedItem;
}

interface FailedExternalMigrationItemState extends BaseExternalMigrationItemState {
  readonly status: ExternalMigrationItemStatus.Failed;
  readonly error: Error;
}

export type ExternalMigrationItemState =
  | NotStartedExternalMigrationItemState
  | ProcessingExternalMigrationItemState
  | ImportedExternalMigrationItemState
  | FailedExternalMigrationItemState;
