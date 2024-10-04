import {ImportQueueItem} from '@shared/types';
import admin from 'firebase-admin';
import logger from 'firebase-functions/logger';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';

admin.initializeApp();

export const processImportQueue = onDocumentCreated('/importQueue/{pushId}', async (event) => {
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
    await processItem(importItem);

    await admin.firestore().collection('items').add({
      url: importItem.url,
      isSaved: true,
      source: 'extension',
      savedAt: importItem.createdAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Remove the processed item from the queue
    await admin.firestore().collection('importQueue').doc(pushId).delete();

    logger.log(`Successfully processed and removed item ${pushId}`);
  } catch (error) {
    logger.error(`Error processing item ${pushId}:`, error);
    // TODO: Move failed item to a separate "failed" queue.
  }
});

async function processItem(item: ImportQueueItem): Promise<void> {
  // Implement your import processing logic here
  // This is where you'll handle the actual import process
  logger.log('Processing item:', item);
  // Example: await someImportFunction(item);
}
