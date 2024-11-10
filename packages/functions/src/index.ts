import {logger} from 'firebase-functions';
import {auth} from 'firebase-functions/v1';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';

import {IMPORT_QUEUE_DB_COLLECTION} from '@shared/lib/constants';
import {asyncTryWithErrorMessage} from '@shared/lib/errors';

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

    try {
      logger.info(`[IMPORT] Claiming import queue item...`, logDetails);
      await updateImportQueueItem(importQueueItemId, {
        status: ImportQueueItemStatus.Processing,
      });

      logger.info(`[IMPORT] Importing queue item...`, logDetails);
      await importFeedItem(importQueueItem);

      // Remove the import queue item once everything else has processed successfully.
      logger.info(`[IMPORT] Deleting import queue item...`, logDetails);
      await deleteImportQueueItem(importQueueItemId);

      logger.info(`[IMPORT] Done processing import queue item`, logDetails);
    } catch (error) {
      logger.error(`[IMPORT] Error processing import queue item`, {
        ...logDetails,
        // TODO: Figure out a simpler solution here that is reusable.
        error:
          typeof error === 'object' && error !== null && 'message' in error ? error.message : error,
      });
      await updateImportQueueItem(importQueueItemId, {
        status: ImportQueueItemStatus.Failed,
      });
    }
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

  asyncTryWithErrorMessage({
    asyncFn: async () => {
      logger.info(`[WIPEOUT] Wiping out user ${userId}...`);
      await wipeoutUser(userId);
      logger.info(`[WIPEOUT] Successfully wiped out user ${userId}`);
    },
    onError: (error) => {
      logger.error(`[WIPEOUT] Failed to wipe out user`, {
        error,
        userId,
      });
    },
  });
});
