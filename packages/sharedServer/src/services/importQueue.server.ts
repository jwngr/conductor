import type {WithFieldValue} from 'firebase-admin/firestore';

import {
  asyncTryAll,
  prefixError,
  prefixErrorResult,
  prefixResultIfError,
} from '@shared/lib/errorUtils.shared';
import {withFirestoreTimestamps} from '@shared/lib/parser.shared';
import {requestGet} from '@shared/lib/requests.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {FeedItemId} from '@shared/types/feedItems.types';
import {
  ImportQueueItem,
  ImportQueueItemFromStorage,
  ImportQueueItemId,
  makeImportQueueItem,
} from '@shared/types/importQueue.types';
import type {AsyncResult, Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

import {eventLogService} from './eventLog.server';
import {serverTimestampSupplier} from './firebase.server';

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

type ImportQueueCollectionService = ServerFirestoreCollectionService<
  ImportQueueItemId,
  ImportQueueItem,
  ImportQueueItemFromStorage
>;

export class ServerImportQueueService {
  private readonly importQueueCollectionService: ImportQueueCollectionService;
  private readonly feedItemsService: ServerFeedItemsService;
  private readonly firecrawlService: ServerFirecrawlService;

  constructor(args: {
    readonly importQueueCollectionService: ImportQueueCollectionService;
    readonly feedItemsService: ServerFeedItemsService;
    readonly firecrawlService: ServerFirecrawlService;
  }) {
    this.importQueueCollectionService = args.importQueueCollectionService;
    this.feedItemsService = args.feedItemsService;
    this.firecrawlService = args.firecrawlService;
  }

  /**
   * Adds a new import queue item to Firestore.
   */
  public async create(
    importQueueItemDetails: Omit<
      ImportQueueItem,
      'importQueueItemId' | 'createdTime' | 'lastUpdatedTime' | 'status'
    >
  ): AsyncResult<ImportQueueItem> {
    // Create the new feed source in memory.
    const makeImportQueueItemResult = makeImportQueueItem({
      feedItemId: importQueueItemDetails.feedItemId,
      accountId: importQueueItemDetails.accountId,
      url: importQueueItemDetails.url,
    });
    if (!makeImportQueueItemResult.success) return makeImportQueueItemResult;
    const newImportQueueItem = makeImportQueueItemResult.value;

    // Create the new feed source in Firestore.
    const createResult = await this.importQueueCollectionService.setDoc(
      newImportQueueItem.importQueueItemId,
      withFirestoreTimestamps(newImportQueueItem, serverTimestampSupplier)
    );
    if (!createResult.success) {
      return prefixErrorResult(createResult, 'Error creating import queue item in Firestore');
    }
    return makeSuccessResult(newImportQueueItem);
  }

  /**
   * Imports a feed item, pulling in the raw HTML and LLM context.
   */
  async importFeedItem(importQueueItem: ImportQueueItem): AsyncResult<void> {
    const url = importQueueItem.url;
    const isSafeUrlResult = await validateFeedItemUrl(url);
    if (!isSafeUrlResult.success) {
      return prefixErrorResult(isSafeUrlResult, 'Error validating feed item URL');
    }

    const importAllDataResult = await asyncTryAll([
      this.importFeedItemHtml({
        url: importQueueItem.url,
        feedItemId: importQueueItem.feedItemId,
        accountId: importQueueItem.accountId,
      }),
      this.importFeedItemFirecrawl({
        url: importQueueItem.url,
        feedItemId: importQueueItem.feedItemId,
        accountId: importQueueItem.accountId,
      }),
    ]);

    // TODO: Make this multi-result error handling pattern simpler.
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
    readonly accountId: AccountId;
  }): AsyncResult<void> {
    const {url, feedItemId, accountId} = args;

    // TODO: Extend the import functionality here:
    // 1. Handle more than just HTML.
    // 2. Extract a canonical URL (resolving redirects and removing tracking parameters).
    // 3. Handle images more gracefully (download and replace links in the HTML?).
    const fetchDataResult = await requestGet<string>(url, {
      headers: {'Content-Type': 'text/html'},
    });

    if (!fetchDataResult.success) {
      return prefixErrorResult(fetchDataResult, 'Error fetching raw feed item HTML');
    }

    const rawHtml = fetchDataResult.value;

    const saveHtmlResult = await this.feedItemsService.saveRawHtmlToStorage({
      feedItemId,
      accountId,
      rawHtml,
    });

    return prefixResultIfError(saveHtmlResult, 'Error saving feed item HTML');
  }

  /**
   * Imports a feed item's Firecrawl data and saves it to storage.
   */
  private async importFeedItemFirecrawl(args: {
    readonly url: string;
    readonly feedItemId: FeedItemId;
    readonly accountId: AccountId;
  }): AsyncResult<void> {
    const {url, feedItemId, accountId} = args;

    const fetchDataResult = await this.firecrawlService.fetch(url);

    if (!fetchDataResult.success) {
      return prefixErrorResult(fetchDataResult, 'Error fetching Firecrawl data for feed item');
    }

    const firecrawlData = fetchDataResult.value;

    const saveFirecrawlDataResult = await asyncTryAll([
      this.feedItemsService.saveMarkdownToStorage({
        feedItemId,
        accountId,
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

    eventLogService.logFeedItemImportedEvent({feedItemId});

    return makeSuccessResult(undefined);
  }

  /**
   * Updates an import queue item in Firestore.
   */
  public async updateImportQueueItem(
    importQueueItemId: ImportQueueItemId,
    updates: Partial<WithFieldValue<Pick<ImportQueueItem, 'status'>>>
  ): AsyncResult<void> {
    const updateResult = await this.importQueueCollectionService.updateDoc(
      importQueueItemId,
      updates
    );
    return prefixResultIfError(updateResult, 'Error updating import queue item in Firestore');
  }

  /**
   * Permanently deletes an individual import queue item.
   */
  public async deleteImportQueueItem(importQueueItemId: ImportQueueItemId): AsyncResult<void> {
    const deleteResult = await this.importQueueCollectionService.deleteDoc(importQueueItemId);
    return prefixResultIfError(deleteResult, 'Error deleting import queue item in Firestore');
  }

  /**
   * Permanently deletes all import queue items associated with an account.
   */
  public async deleteAllForAccount(accountId: AccountId): AsyncResult<void> {
    // TODO: Consider introducing a `batchDeleteAllForAccount` method.

    // Fetch the IDs for all of the account's import queue items.
    const query = this.importQueueCollectionService
      .getCollectionRef()
      .where('accountId', '==', accountId);
    const queryResult = await this.importQueueCollectionService.fetchQueryIds(query);
    if (!queryResult.success) {
      return prefixErrorResult(
        queryResult,
        'Error fetching import queue items to delete for account'
      );
    }

    // Delete all of the account's import queue items.
    const docIdsToDelete = queryResult.value;
    return await this.importQueueCollectionService.batchDeleteDocs(docIdsToDelete);
  }
}
