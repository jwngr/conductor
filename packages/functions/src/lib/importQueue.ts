import {DocumentSnapshot} from 'firebase-admin/firestore';

import {IMPORT_QUEUE_DB_COLLECTION} from '@shared/lib/constants';
import {asyncTryAll, prefixError} from '@shared/lib/errors';

import {FeedItemId} from '@shared/types/feedItems.types';
import {ImportQueueItem, ImportQueueItemId} from '@shared/types/importQueue.types';
import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';

import {
  saveMarkdownToStorage,
  saveRawHtmlToStorage,
  updateImportedFeedItemInFirestore,
} from '@src/lib/feedItems.func';
import {
  batchDeleteFirestoreDocuments,
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
  const importAllDataResult = await asyncTryAll([
    importFeedItemHtml({
      url: importQueueItem.url,
      feedItemId: importQueueItem.feedItemId,
      userId: importQueueItem.userId,
    }),
    importFeedItemFirecrawl({
      url: importQueueItem.url,
      feedItemId: importQueueItem.feedItemId,
      userId: importQueueItem.userId,
    }),
  ]);

  const importAllDataResultError = importAllDataResult.success
    ? importAllDataResult.value.results.find((result) => !result.success)?.error
    : importAllDataResult.error;
  if (importAllDataResultError) {
    return makeErrorResult(prefixError(importAllDataResultError, 'Error importing feed item'));
  }

  return makeSuccessResult(undefined);
}

/**
 * Imports a feed item's HTML and saves it to storage.
 */
export async function importFeedItemHtml(args: {
  readonly url: string;
  readonly feedItemId: FeedItemId;
  readonly userId: UserId;
}): AsyncResult<void> {
  const {url, feedItemId, userId} = args;

  const fetchDataResult = await fetchRawHtml(url);

  if (!fetchDataResult.success) {
    return makeErrorResult(prefixError(fetchDataResult.error, 'Error fetching raw feed item HTML'));
  }

  const rawHtml = fetchDataResult.value;

  const saveHtmlResult = await saveRawHtmlToStorage({feedItemId, userId, rawHtml});

  if (!saveHtmlResult.success) {
    return makeErrorResult(prefixError(saveHtmlResult.error, 'Error saving feed item HTML'));
  }

  return makeSuccessResult(undefined);
}

/**
 * Imports a feed item's Firecrawl data and saves it to storage.
 */
export async function importFeedItemFirecrawl(args: {
  readonly url: string;
  readonly feedItemId: FeedItemId;
  readonly userId: UserId;
}): AsyncResult<void> {
  const {url, feedItemId, userId} = args;

  const fetchDataResult = await fetchFirecrawlData(url);

  if (!fetchDataResult.success) {
    return makeErrorResult(
      prefixError(fetchDataResult.error, 'Error fetching Firecrawl data for feed item')
    );
  }

  const firecrawlData = fetchDataResult.value;

  const saveFirecrawlDataResult = await asyncTryAll([
    saveMarkdownToStorage({
      feedItemId: feedItemId,
      userId: userId,
      markdown: firecrawlData.markdown,
    }),
    updateImportedFeedItemInFirestore(feedItemId, {
      links: firecrawlData.links,
      title: firecrawlData.title,
      description: firecrawlData.description,
    }),
  ]);

  const saveFirecrawlDataResultError = saveFirecrawlDataResult.success
    ? saveFirecrawlDataResult.value.results.find((result) => !result.success)?.error
    : saveFirecrawlDataResult.error;
  if (saveFirecrawlDataResultError) {
    return makeErrorResult(
      prefixError(saveFirecrawlDataResultError, 'Error saving Firecrawl data for feed item')
    );
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
