import {DocumentSnapshot} from 'firebase-admin/firestore';
import {logger} from 'firebase-functions';

import {IMPORT_QUEUE_DB_COLLECTION} from '@shared/lib/constants';
import {asyncTryAll} from '@shared/lib/errors';

import {ParsedFirecrawlData} from '@shared/types/firecrawl.types';
import {ImportQueueItem, ImportQueueItemId} from '@shared/types/importQueue.types';
import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';

import {batchDeleteFirestoreDocuments} from '@src/lib/batch';
import {
  saveMarkdownToStorage,
  saveRawHtmlToStorage,
  updateImportedFeedItemInFirestore,
} from '@src/lib/feedItems';
import {
  deleteFirestoreDoc,
  FieldValue,
  firestore,
  getFirestoreQuerySnapshot,
  updateFirestoreDoc,
} from '@src/lib/firebaseAdmin';
import {fetchFirecrawlData} from '@src/lib/firecrawl';
import {fetchRawHtml} from '@src/lib/scraper';

/**
 * Imports a feed item, pulling in the raw HTML and LLM context.
 */
export async function importFeedItem(importQueueItem: ImportQueueItem): AsyncResult<void> {
  // Fetch in parallel.
  const fetchDataResult = await asyncTryAll<[string, ParsedFirecrawlData]>([
    fetchRawHtml(importQueueItem.url),
    fetchFirecrawlData(importQueueItem.url),
  ]);
  if (!fetchDataResult.success) {
    const errors = fetchDataResult.error;
    errors.forEach((error) => {
      logger.error(`[IMPORT] Error fetching raw feed item data`, {
        error,
      });
    });
    return makeErrorResult(errors[0]);
  }

  const [rawHtml, firecrawlData] = fetchDataResult.value;

  // Save in parallel.
  const saveDataResult = await asyncTryAll<[undefined, undefined, undefined]>([
    saveRawHtmlToStorage({
      feedItemId: importQueueItem.feedItemId,
      userId: importQueueItem.userId,
      rawHtml,
    }),
    saveMarkdownToStorage({
      feedItemId: importQueueItem.feedItemId,
      userId: importQueueItem.userId,
      markdown: firecrawlData.markdown,
    }),
    updateImportedFeedItemInFirestore(importQueueItem.feedItemId, {
      links: firecrawlData.links,
      title: firecrawlData.title,
      description: firecrawlData.description,
    }),
  ]);
  if (!saveDataResult.success) {
    saveDataResult.error.forEach((currentError) => {
      logger.error(`[IMPORT] Error saving imported feed item data`, {error: currentError});
    });
    return makeErrorResult(saveDataResult.error[0]);
  }
  return makeSuccessResult(undefined);
}

/**
 * Updates an import queue item in Firestore.
 */
export async function updateImportQueueItem(
  importQueueItemId: ImportQueueItemId,
  updates: Partial<Pick<ImportQueueItem, 'status'>>
): AsyncResult<void> {
  const fullUpdates: Partial<ImportQueueItem> = {
    ...updates,
    lastUpdatedTime: FieldValue.serverTimestamp(),
  };

  return await updateFirestoreDoc<ImportQueueItem>(
    firestore.collection(IMPORT_QUEUE_DB_COLLECTION).doc(importQueueItemId),
    fullUpdates
  );
}

/**
 * Hard-deletes an individual import queue item.
 */
export async function deleteImportQueueItem(
  importQueueItemId: ImportQueueItemId
): AsyncResult<void> {
  return deleteFirestoreDoc(`${IMPORT_QUEUE_DB_COLLECTION}/${importQueueItemId}`);
}

/**
 * Hard-deletes all import queue items associated with a user.
 */
export async function deleteImportQueueDocsForUser(userId: UserId): AsyncResult<void> {
  // TODO: Can I just use the keys instead of getting the full docs?
  const userImportQueueItemDocsResult = await getFirestoreQuerySnapshot(
    firestore.collection(IMPORT_QUEUE_DB_COLLECTION).where('userId', '==', userId)
  );

  if (!userImportQueueItemDocsResult.success) {
    return userImportQueueItemDocsResult;
  }
  const userImportQueueItemDocs = userImportQueueItemDocsResult.value;

  return await batchDeleteFirestoreDocuments(
    userImportQueueItemDocs.docs.map((doc: DocumentSnapshot) => doc.ref)
  );
}
