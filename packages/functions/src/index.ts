import {FeedItem, ImportQueueItem} from '@shared/types';
import admin from 'firebase-admin';
import logger from 'firebase-functions/logger';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';

// TODO: Use constants from shared package.
const FEED_ITEM_COLLECTION = 'feedItems';
const IMPORT_QUEUE_COLLECTION = 'importQueue';

admin.initializeApp();

// const storage = admin.storage();
const firestore = admin.firestore();

// TODO: Make this idempotent given the "at least once" guarantee.
export const processImportQueue = onDocumentCreated(
  `/${IMPORT_QUEUE_COLLECTION}/{pushId}`,
  async (event) => {
    const {pushId} = event.params;
    logger.log(`Processing item ${pushId}`);

    const snapshot = event.data;
    if (!snapshot) {
      logger.log('No data associated with import queue event');
      return;
    }

    // TODO: Properly validate the import item schema.
    const importItem = snapshot.data() as ImportQueueItem;

    logger.log(`URL received: ${importItem.url}`);

    try {
      // Process the item.
      await processItem(importItem);

      // Update the item with the new import status.
      const update: Partial<FeedItem> = {
        isImporting: false,
        lastImportedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await firestore.collection(FEED_ITEM_COLLECTION).doc(importItem.feedItemId).update(update);

      // Remove the processed item from the queue, waiting until the previous item is processed.
      // TODO: Can this be done in a transaction?
      await firestore.collection(IMPORT_QUEUE_COLLECTION).doc(pushId).delete();

      logger.log(`Successfully processed and removed item ${pushId}`);
    } catch (error) {
      logger.error(`Error processing item ${pushId}:`, error);
      // TODO: Move failed item to a separate "failed" queue.
    }
  }
);

async function processItem(item: ImportQueueItem): Promise<void> {
  // Implement your import processing logic here
  // Download the HTML of the item and store it in Firebase Cloud Storage.
  // const html = await fetch(item.url).then((res) => res.text());
  // const bucket = storage.bucket();
  // const file = bucket.file(item.url);
  // await file.save(html);

  // This is where you'll handle the actual import process
  logger.log('Processing item:', item);
  // Example: await someImportFunction(item);
}
