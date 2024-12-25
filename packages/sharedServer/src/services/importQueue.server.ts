import type {CollectionReference, DocumentSnapshot} from 'firebase-admin/firestore';
import {FieldValue} from 'firebase-admin/firestore';

import {asyncTryAll, prefixError} from '@shared/lib/errorUtils.shared';
import {requestGet} from '@shared/lib/requests.shared';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {ImportQueueItem, ImportQueueItemId} from '@shared/types/importQueue.types';
import type {AsyncResult, Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';

import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';

import {
  batchDeleteFirestoreDocuments,
  deleteFirestoreDocPath,
  getFirestoreQuerySnapshot,
  updateFirestoreDoc,
} from '@sharedServer/lib/firebase.server';

function validateFeedItemUrl(url: string): Result<void> {
  // Parse the URL to validate its structure.
  const parsedUrl = new URL(url);

  // Only allow HTTPS protocols.
  // TODO: Consider allowing other protocols like `http:` and `chrome:` as well.
  if (!['https:'].includes(parsedUrl.protocol)) {
    return makeErrorResult(new Error('Only HTTPS URLs allowed'));
  }

  // Prevent localhost and private IP addresses.
  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.16.') ||
    hostname.startsWith('169.254.') ||
    hostname.endsWith('.local')
  ) {
    return makeErrorResult(new Error('URL cannot point to localhost or private networks'));
  }

  return makeSuccessResult(undefined);
}

export class ServerImportQueueService {
  private readonly importQueueDbRef: CollectionReference;
  private readonly feedItemsService: ServerFeedItemsService;
  private readonly firecrawlService: ServerFirecrawlService;

  constructor(args: {
    readonly importQueueDbRef: CollectionReference;
    readonly feedItemsService: ServerFeedItemsService;
    readonly firecrawlService: ServerFirecrawlService;
  }) {
    this.importQueueDbRef = args.importQueueDbRef;
    this.feedItemsService = args.feedItemsService;
    this.firecrawlService = args.firecrawlService;
  }

  /**
   * Imports a feed item, pulling in the raw HTML and LLM context.
   */
  async importFeedItem(importQueueItem: ImportQueueItem): AsyncResult<void> {
    const url = importQueueItem.url;
    const isSafeUrlResult = await validateFeedItemUrl(url);
    if (!isSafeUrlResult.success) {
      return makeErrorResult(prefixError(isSafeUrlResult.error, 'Error validating feed item URL'));
    }

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

    // TODO: Extend the import functionality here:
    // 1. Handle more than just HTML.
    // 2. Extract a canonical URL (resolving redirects and removing tracking parameters).
    // 3. Handle images more gracefully (download and replace links in the HTML?).
    const fetchDataResult = await requestGet<string>(url, {
      headers: {'Content-Type': 'text/html'},
    });

    if (!fetchDataResult.success) {
      return makeErrorResult(
        prefixError(fetchDataResult.error, 'Error fetching raw feed item HTML')
      );
    }

    const rawHtml = fetchDataResult.value;

    const saveHtmlResult = await this.feedItemsService.saveRawHtmlToStorage({
      feedItemId,
      userId,
      rawHtml,
    });

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
      this.feedItemsService.saveMarkdownToStorage({
        feedItemId: feedItemId,
        userId: userId,
        markdown: firecrawlData.markdown,
      }),
      this.feedItemsService.updateImportedFeedItemInFirestore(feedItemId, {
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
    return deleteFirestoreDocPath(`${this.importQueueDbRef.path}/${importQueueItemId}`);
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
