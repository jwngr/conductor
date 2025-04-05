import type {DocumentSnapshot} from 'firebase-functions/v2/firestore';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseImportQueueItemId} from '@shared/parsers/importQueue.parser';

import type {ImportQueueItem} from '@shared/types/importQueue.types';
import {ImportQueueItemStatus} from '@shared/types/importQueue.types';

import type {ServerImportQueueService} from '@sharedServer/services/importQueue.server';

/**
 * Processes an import queue item.
 */
export async function processImportQueueItem(args: {
  readonly importQueueItemId: string;
  readonly data?: DocumentSnapshot | null;
  readonly importQueueService: ServerImportQueueService;
}): Promise<void> {
  const {importQueueItemId: maybeImportQueueItemId, data, importQueueService} = args;

  logger.log(`[IMPORT] Processing import queue item "${maybeImportQueueItemId}"`);

  const parseIdResult = parseImportQueueItemId(maybeImportQueueItemId);
  if (!parseIdResult.success) {
    logger.error(
      prefixError(parseIdResult.error, '[IMPORT] Invalid import queue item ID. Skipping...'),
      {maybeImportQueueItemId}
    );
    return;
  }
  const importQueueItemId = parseIdResult.value;

  if (!data) {
    logger.error(new Error(`[IMPORT] No data associated with import queue item`), {
      importQueueItemId,
    });
    return;
  }

  // const importQueueItemResult = parseImportQueueItem(data.data());
  // if (!importQueueItemResult.success) {
  //   logger.error(
  //     prefixError(importQueueItemResult.error, '[IMPORT] Invalid import queue item data'),
  //     {importQueueItemId}
  //   );
  //   return;
  // }
  // const importQueueItem = importQueueItemResult.value;
  // TODO: This cast is a lie and it is really a `ImportQueueItemFromSchema` since functions don't
  // seem to auto-convert the data from the snapshot correctly.
  const importQueueItem = data.data() as ImportQueueItem;

  // Avoid double processing by only processing items with a "new" status.
  if (importQueueItem.status !== ImportQueueItemStatus.New) {
    logger.warn(
      `[IMPORT] Import queue item ${importQueueItemId} is not in the "new" status. Skipping...`
    );
    return;
  }

  const logDetails = {
    importQueueItemId,
    feedItemId: importQueueItem.feedItemId,
    accountId: importQueueItem.accountId,
  } as const;

  const handleError = async (errorPrefix: string, error: Error): Promise<void> => {
    logger.error(prefixError(error, errorPrefix), logDetails);
    await importQueueService.updateImportQueueItem(importQueueItemId, {
      status: ImportQueueItemStatus.Failed,
    });
  };

  // Claim the item so that no other function picks it up.
  logger.log(`[IMPORT] Claiming import queue item...`, logDetails);
  const claimItemResult = await importQueueService.updateImportQueueItem(importQueueItemId, {
    status: ImportQueueItemStatus.Processing,
  });
  if (!claimItemResult.success) {
    await handleError('Failed to claim import queue item', claimItemResult.error);
    return;
  }

  // Actually import the feed item.
  logger.log(`[IMPORT] Importing queue item...`, logDetails);
  const importItemResult = await importQueueService.importFeedItem(importQueueItem);
  if (!importItemResult.success) {
    await handleError('Error importing queue item', importItemResult.error);
    return;
  }

  // Remove the import queue item once everything else has processed successfully.
  logger.log(`[IMPORT] Deleting import queue item...`, logDetails);
  const deleteItemResult = await importQueueService.deleteImportQueueItem(importQueueItemId);
  if (!deleteItemResult.success) {
    await handleError('Error deleting import queue item', deleteItemResult.error);
    return;
  }

  logger.log(`[IMPORT] Successfully processed import queue item`, logDetails);
}
