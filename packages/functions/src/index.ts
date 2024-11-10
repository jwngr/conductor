// TODO: Switch to using the Functions logger.
// import logger from 'firebase-functions/logger';
// TODO: Figure out why the import is not working properly for the build.
// import functions from 'firebase-functions/v1';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';

import {IMPORT_QUEUE_DB_COLLECTION} from '@shared/lib/constants';

import {
  createImportQueueItemId,
  ImportQueueItem,
  ImportQueueItemStatus,
} from '@shared/types/importQueue.types';

import {deleteImportQueueItem, importFeedItem, updateImportQueueItem} from '@src/lib/importQueue';

// import {wipeoutUser} from '@src/lib/wipeout';

/**
 * Processes an import queue item when it is created.
 */
// TODO: Make this idempotent given the "at least once" guarantee.
export const processImportQueueOnDocumentCreated = onDocumentCreated(
  `/${IMPORT_QUEUE_DB_COLLECTION}/{importQueueItemId}`,
  async (event) => {
    const {importQueueItemId: maybeImportQueueItemId} = event.params;

    const importQueueItemIdResult = createImportQueueItemId(maybeImportQueueItemId);
    if (!importQueueItemIdResult.success) {
      console.error(
        `[IMPORT] Invalid import queue item ID "${maybeImportQueueItemId}": ${importQueueItemIdResult.error}`
      );
      return;
    }
    const importQueueItemId = importQueueItemIdResult.value;

    const snapshot = event.data;
    if (!snapshot) {
      console.error(`[IMPORT] No data associated with import queue item ${importQueueItemId}`);
      return;
    }

    // TODO: Properly validate the import item schema.
    const importQueueItem = {importQueueItemId, ...snapshot.data()} as ImportQueueItem;

    // Avoid double processing by only processing items with a "new" status.
    if (importQueueItem.status !== ImportQueueItemStatus.New) {
      console.warn(
        `[IMPORT] Import queue item ${importQueueItemId} is not in the "new" status. Skipping...`
      );
      return;
    }

    try {
      console.log(`[IMPORT] Claiming import queue item ${importQueueItemId}...`);
      await updateImportQueueItem(importQueueItemId, {
        status: ImportQueueItemStatus.Processing,
      });

      console.log(`[IMPORT] Importing queue item ${importQueueItemId}...`, {
        importQueueItemId,
        feedItemId: importQueueItem.feedItemId,
        userId: importQueueItem.userId,
      });
      await importFeedItem(importQueueItem);

      // Remove the import queue item once everything else has processed successfully.
      console.log(`[IMPORT] Deleting import queue item ${importQueueItemId}...`);
      await deleteImportQueueItem(importQueueItemId);

      console.log(`[IMPORT] Done processing import queue item ${importQueueItemId}`);
    } catch (error) {
      console.error(`[IMPORT] Error processing import queue item ${importQueueItemId}:`, error);
      await updateImportQueueItem(importQueueItemId, {
        status: ImportQueueItemStatus.Failed,
      });
    }
  }
);

/**
 * Hard-deletes all data associated with a user when their Firebase auth account is deleted.
 */
// export const wipeoutUserOnAuthDelete = functions.auth.user().onDelete(async (firebaseUser) => {
//   const userId = firebaseUser.uid;
//   try {
//     console.log(`[WIPEOUT] Wiping out user ${userId}...`);
//     await wipeoutUser(userId);
//     console.log(`[WIPEOUT] Successfully wiped out user ${userId}`);
//   } catch (error) {
//     console.error(`[WIPEOUT] Error wiping out user ${userId}:`, error);
//   }
// });
