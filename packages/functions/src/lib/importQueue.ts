import {IMPORT_QUEUE_DB_COLLECTION} from '@shared/lib/constants';

import {ImportQueueItem, ImportQueueItemId} from '@shared/types/importQueue.types';
import {UserId} from '@shared/types/user.types';

import {batchDeleteFirestoreDocuments} from '@src/lib/batch';
import {firestore} from '@src/lib/firebase';

import {
  saveMarkdownToStorage,
  saveRawHtmlToStorage,
  updateImportedFeedItemInFirestore,
} from './feedItems';
import {fetchFirecrawlData} from './firecrawl';
import {fetchRawHtml} from './scraper';

/**
 * Imports a feed item, pulling in the raw HTML and LLM context.
 */
export async function importFeedItem(importQueueItem: ImportQueueItem): Promise<void> {
  // Fetch in parallel.
  const [rawHtml, firecrawlResult] = await Promise.all([
    fetchRawHtml(importQueueItem.url),
    fetchFirecrawlData(importQueueItem.url),
  ]);

  // Save in parallel.
  await Promise.all([
    saveRawHtmlToStorage({
      feedItemId: importQueueItem.feedItemId,
      userId: importQueueItem.userId,
      rawHtml,
    }),
    saveMarkdownToStorage({
      feedItemId: importQueueItem.feedItemId,
      userId: importQueueItem.userId,
      markdown: firecrawlResult.markdown,
    }),
    updateImportedFeedItemInFirestore(importQueueItem.feedItemId, {
      links: firecrawlResult.links,
      title: firecrawlResult.title,
      description: firecrawlResult.description,
    }),
  ]);
}

/**
 * Hard-deletes an individual import queue item.
 */
export async function deleteImportQueueItem(importQueueItemId: ImportQueueItemId): Promise<void> {
  await firestore.collection(IMPORT_QUEUE_DB_COLLECTION).doc(importQueueItemId).delete();
}

/**
 * Hard-deletes all import queue items associated with a user.
 */
export async function deleteImportQueueDocsForUser(userId: UserId): Promise<void> {
  const userImportQueueItemDocs = await firestore
    .collection(IMPORT_QUEUE_DB_COLLECTION)
    .where('userId', '==', userId)
    .get();

  await batchDeleteFirestoreDocuments(userImportQueueItemDocs.docs.map((doc) => doc.ref));
}
