// TODO: Switch to using the Functions logger.
// import logger from 'firebase-functions/logger';
import auth from 'firebase-functions/v1/auth';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';

import {IMPORT_QUEUE_DB_COLLECTION} from '@shared/lib/constants';

import {ImportQueueItem} from '@shared/types/importQueue';

import {deleteImportQueueItem, importFeedItem} from '@src/lib/importQueue';
import {wipeoutUser} from '@src/lib/wipeout';

/**
 * Processes an import queue item when it is created.
 */
// TODO: Make this idempotent given the "at least once" guarantee.
export const processImportQueueOnDocumentCreated = onDocumentCreated(
  `/${IMPORT_QUEUE_DB_COLLECTION}/{importQueueItemId}`,
  async (event) => {
    const {importQueueItemId} = event.params;

    const snapshot = event.data;
    if (!snapshot) {
      console.error(`[IMPORT] No data associated with import queue item ${importQueueItemId}`);
      return;
    }

    // TODO: Properly validate the import item schema.
    const importQueueItem = {
      ...snapshot.data(),
      importQueueItemId,
    } as ImportQueueItem;

    try {
      console.log(`[IMPORT] Processing import queue item ${importQueueItemId}...`, {
        importQueueItemId,
        feedItemId: importQueueItem.feedItemId,
        userId: importQueueItem.userId,
      });

      await importFeedItem(importQueueItem);

      console.log(`[IMPORT] Successfully processed import queue item ${importQueueItemId}`);

      // Remove the import queue item once everything else has processed successfully.
      console.log(`[IMPORT] Deleting import queue item ${importQueueItemId}...`);
      await deleteImportQueueItem(importQueueItemId);

      console.log(`[IMPORT] Successfully deleted import queue item ${importQueueItemId}`);
    } catch (error) {
      console.error(`[IMPORT] Error processing import queue item ${importQueueItemId}:`, error);
      // TODO: Move failed item to a separate "failed" queue.
    }
  }
);

/**
 * Hard-deletes all data associated with a user when their Firebase auth account is deleted.
 */
export const wipeoutUserOnAuthDelete = auth.user().onDelete(async (firebaseUser) => {
  const userId = firebaseUser.uid;
  try {
    console.log(`[WIPEOUT] Wiping out user ${userId}...`);
    await wipeoutUser(userId);
    console.log(`[WIPEOUT] Successfully wiped out user ${userId}`);
  } catch (error) {
    console.error(`[WIPEOUT] Error wiping out user ${userId}:`, error);
  }
});
