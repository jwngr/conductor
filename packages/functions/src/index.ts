import {logger} from 'firebase-functions';
import {auth} from 'firebase-functions/v1';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';

import {IMPORT_QUEUE_DB_COLLECTION} from '@shared/lib/constants';

import {
  createImportQueueItemId,
  ImportQueueItem,
  ImportQueueItemStatus,
} from '@shared/types/importQueue.types';
import {createUserId} from '@shared/types/user.types';

import {deleteImportQueueItem, importFeedItem, updateImportQueueItem} from '@src/lib/importQueue';
import {wipeoutUser} from '@src/lib/wipeout';

/**
 * Processes an import queue item when it is created.
 */
export const processImportQueueOnDocumentCreated = onDocumentCreated(
  `/${IMPORT_QUEUE_DB_COLLECTION}/{importQueueItemId}`,
  async (event) => {
    const {importQueueItemId: maybeImportQueueItemId} = event.params;

    const importQueueItemIdResult = createImportQueueItemId(maybeImportQueueItemId);
    if (!importQueueItemIdResult.success) {
      logger.error(
        `[IMPORT] Invalid import queue item ID "${maybeImportQueueItemId}": ${importQueueItemIdResult.error}`
      );
      return;
    }
    const importQueueItemId = importQueueItemIdResult.value;

    const snapshot = event.data;
    if (!snapshot) {
      logger.error(`[IMPORT] No data associated with import queue item ${importQueueItemId}`);
      return;
    }

    // TODO: Properly validate the import item schema.
    const importQueueItem = {importQueueItemId, ...snapshot.data()} as ImportQueueItem;

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
      userId: importQueueItem.userId,
    } as const;

    const handleError = async (errorMessage: string, errorDetails: Record<string, unknown>) => {
      logger.error(errorMessage, {
        ...logDetails,
        ...errorDetails,
      });
      await updateImportQueueItem(importQueueItemId, {status: ImportQueueItemStatus.Failed});
    };

    // Claim the item so that no other function picks it up.
    logger.info(`[IMPORT] Claiming import queue item...`, logDetails);
    const claimItemResult = await updateImportQueueItem(importQueueItemId, {
      status: ImportQueueItemStatus.Processing,
    });
    if (!claimItemResult.success) {
      await handleError('Failed to claim import queue item', {error: claimItemResult.error});
      return;
    }

    // Actually import the feed item.
    logger.info(`[IMPORT] Importing queue item...`, logDetails);
    const importItemResult = await importFeedItem(importQueueItem);
    if (!importItemResult.success) {
      await handleError('Error importing queue item', {error: importItemResult.error});
      await updateImportQueueItem(importQueueItemId, {status: ImportQueueItemStatus.Failed});
    }

    // Remove the import queue item once everything else has processed successfully.
    logger.info(`[IMPORT] Deleting import queue item...`, logDetails);
    const deleteItemResult = await deleteImportQueueItem(importQueueItemId);
    if (!deleteItemResult.success) {
      await handleError('Error deleting import queue item', {
        error: deleteItemResult.error,
      });
    }

    logger.info(`[IMPORT] Successfully processed import queue item`, logDetails);
  }
);

/**
 * Hard-deletes all data associated with a user when their Firebase auth account is deleted.
 */
export const wipeoutUserOnAuthDelete = auth.user().onDelete(async (firebaseUser) => {
  const userIdResult = createUserId(firebaseUser.uid);
  if (!userIdResult.success) {
    logger.error('[WIPEOUT] Invalid user ID. Not wiping out user.', {
      error: userIdResult.error,
      userId: firebaseUser.uid,
    });
    return;
  }
  const userId = userIdResult.value;

  logger.info(`[WIPEOUT] Wiping out user...`, {userId});
  const wipeoutUserResult = await wipeoutUser(userId);
  if (!wipeoutUserResult.success) {
    logger.error(`[WIPEOUT] Failed to wipe out user`, {error: wipeoutUserResult.error, userId});
    return;
  }

  logger.info(`[WIPEOUT] Successfully wiped out user`, {userId});
});
