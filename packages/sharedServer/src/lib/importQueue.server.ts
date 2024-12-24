import {CollectionReference, DocumentSnapshot} from 'firebase-admin/firestore';

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
} from '@sharedServer/lib/feedItems.server';
import {
  batchDeleteFirestoreDocuments,
  deleteFirestoreDocPath,
  FieldValue,
  getFirestoreQuerySnapshot,
  updateFirestoreDoc,
} from '@sharedServer/lib/firebase.server';
import {ServerFirecrawlService} from '@sharedServer/lib/firecrawl.server';
import {fetchRawHtml} from '@sharedServer/lib/scraper.server';

export class ServerImportQueueService {
  private readonly importQueueDbRef: CollectionReference;
  private readonly firecrawlService: ServerFirecrawlService;

  constructor(args: {
    readonly importQueueDbRef: CollectionReference;
    readonly firecrawlService: ServerFirecrawlService;
  }) {
    this.importQueueDbRef = args.importQueueDbRef;
    this.firecrawlService = args.firecrawlService;
  }

  /**
   * Imports a feed item, pulling in the raw HTML and LLM context.
   */
  async improtFeedItem(importQueueItem: ImportQueueItem): AsyncResult<void> {
    const importAllDataResult = await asyncTryAll([
      this.importFeedItemHtml({
        url: importQueueItem.url,
        feedItemId: importQueueItem.feedItemId,
        userId: importQueueItem.userId,
      }),
      this.importFeedItemFirecrawl({
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
  private async importFeedItemHtml(args: {
    readonly url: string;
    readonly feedItemId: FeedItemId;
    readonly userId: UserId;
  }): AsyncResult<void> {
    const {url, feedItemId, userId} = args;

    const fetchDataResult = await fetchRawHtml(url);

    if (!fetchDataResult.success) {
      return makeErrorResult(
        prefixError(fetchDataResult.error, 'Error fetching raw feed item HTML')
      );
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
  private async importFeedItemFirecrawl(args: {
    readonly url: string;
    readonly feedItemId: FeedItemId;
    readonly userId: UserId;
  }): AsyncResult<void> {
    const {url, feedItemId, userId} = args;

    const fetchDataResult = await this.firecrawlService.fetch(url);

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
  public async updateImportQueueItem(
    importQueueItemId: ImportQueueItemId,
    updates: Partial<Pick<ImportQueueItem, 'status'>>
  ): AsyncResult<void> {
    const fullUpdates: Partial<ImportQueueItem> = {
      ...updates,
      lastUpdatedTime: FieldValue.serverTimestamp(),
    };

    return await updateFirestoreDoc<ImportQueueItem>(
      this.importQueueDbRef.doc(importQueueItemId),
      fullUpdates
    );
  }

  /**
   * Permanently deletes an individual import queue item.
   */
  public async deleteImportQueueItem(importQueueItemId: ImportQueueItemId): AsyncResult<void> {
    return deleteFirestoreDocPath(`${IMPORT_QUEUE_DB_COLLECTION}/${importQueueItemId}`);
  }

  /**
   * Permanently deletes all import queue items associated with a user.
   */
  public async deleteAllForUser(userId: UserId): AsyncResult<void> {
    // TODO: Can I just use the keys instead of getting the full docs?
    const userImportQueueItemDocsResult = await getFirestoreQuerySnapshot(
      this.importQueueDbRef.where('userId', '==', userId)
    );

    if (!userImportQueueItemDocsResult.success) {
      return userImportQueueItemDocsResult;
    }
    const userImportQueueItemDocs = userImportQueueItemDocsResult.value;

    return await batchDeleteFirestoreDocuments(
      userImportQueueItemDocs.docs.map((doc: DocumentSnapshot) => doc.ref)
    );
  }
}
