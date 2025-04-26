import {
  FEED_ITEM_FILE_NAME_HTML,
  FEED_ITEM_FILE_NAME_LLM_CONTEXT,
  FEED_ITEM_FILE_NAME_TRANSCRIPT,
} from '@shared/lib/constants.shared';
import {
  asyncTry,
  asyncTryAll,
  prefixError,
  prefixErrorResult,
  prefixResultIfError,
} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {requestGet} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {isValidUrl} from '@shared/lib/urls.shared';
import {assertNever, omitUndefined} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedItemType} from '@shared/types/feedItems.types';
import type {
  FeedItem,
  FeedItemFromStorage,
  FeedItemId,
  FeedItemSource,
  XkcdFeedItem,
  YouTubeFeedItem,
} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import {eventLogService} from '@sharedServer/services/eventLog.server';
import {storage} from '@sharedServer/services/firebase.server';
import type {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

import {generateHierarchicalSummary} from '@sharedServer/lib/summarization.server';
import {fetchXkcdComic} from '@sharedServer/lib/xkcd.server';
import {fetchYouTubeTranscript} from '@sharedServer/lib/youtube.server';

type FeedItemCollectionService = ServerFirestoreCollectionService<
  FeedItemId,
  FeedItem,
  FeedItemFromStorage
>;

export class ServerFeedItemsService {
  private readonly storageCollectionPath: string;
  private readonly firecrawlService: ServerFirecrawlService;
  private readonly feedItemsCollectionService: FeedItemCollectionService;

  constructor(args: {
    readonly storageCollectionPath: string;
    readonly firecrawlService: ServerFirecrawlService;
    readonly feedItemsCollectionService: FeedItemCollectionService;
  }) {
    this.storageCollectionPath = args.storageCollectionPath;
    this.firecrawlService = args.firecrawlService;
    this.feedItemsCollectionService = args.feedItemsCollectionService;
  }

  public async createFeedItem(args: {
    readonly url: string;
    readonly feedItemSource: FeedItemSource;
    readonly accountId: AccountId;
    readonly title: string;
    readonly description: string | null;
  }): AsyncResult<FeedItemId | null> {
    const {url, accountId, feedItemSource, title, description} = args;

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      return makeErrorResult(new Error(`Invalid URL provided for feed item: "${url}"`));
    }

    const feedItemResult = SharedFeedItemHelpers.makeFeedItem({
      url: trimmedUrl,
      feedItemSource,
      accountId,
      title,
      description,
    });
    if (!feedItemResult.success) return feedItemResult;
    const feedItem = feedItemResult.value;

    const addFeedItemResult = await this.feedItemsCollectionService.setDoc(
      feedItem.feedItemId,
      feedItem
    );

    if (!addFeedItemResult.success) {
      return prefixErrorResult(addFeedItemResult, 'Error creating feed item in Firestore');
    }

    return makeSuccessResult(feedItem.feedItemId);
  }

  /**
   * Updates a feed item in Firestore.
   */
  public async updateFeedItem(
    feedItemId: FeedItemId,
    updates: Partial<FeedItem>
  ): AsyncResult<void> {
    const updateResult = await this.feedItemsCollectionService.updateDoc(
      feedItemId,
      omitUndefined({
        title: updates.title,
        description: updates.description,
        summary: updates.summary,
        outgoingLinks: updates.outgoingLinks,
        importState: updates.importState,
      })
    );
    return prefixResultIfError(updateResult, 'Error updating imported feed item in Firestore');
  }

  /**
   * Writes content to storage file.
   */
  private async writeFileToStorage(args: {
    // Path info.
    readonly feedItemId: FeedItemId;
    readonly accountId: AccountId;
    readonly filename: string;
    // Content info.
    readonly content: string;
    readonly contentType: string;
  }): AsyncResult<void> {
    const {feedItemId, content, accountId, filename, contentType} = args;
    const storagePath = this.getStoragePath({feedItemId, accountId, filename});
    return await asyncTry(async () => {
      const file = storage.bucket().file(storagePath);
      await file.save(content, {contentType});
    });
  }

  /**
   * Permanently deletes all feed items associated with an account.
   */
  public async deleteAllForAccount(accountId: AccountId): AsyncResult<void> {
    // Fetch the IDs for all of the account's feed items.
    const query = this.feedItemsCollectionService
      .getCollectionRef()
      .where('accountId', '==', accountId);
    const queryResult = await this.feedItemsCollectionService.fetchQueryIds(query);
    if (!queryResult.success) {
      return prefixErrorResult(queryResult, 'Error fetching feed items to delete for account');
    }

    // Delete all of the account's feed items.
    const docIdsToDelete = queryResult.value;
    return await this.feedItemsCollectionService.batchDeleteDocs(docIdsToDelete);
  }

  /**
   * Permanently deletes all storage files associated with an account.
   */
  public async deleteStorageFilesForAccount(accountId: AccountId): AsyncResult<void> {
    return await asyncTry(async () =>
      storage.bucket().deleteFiles({
        prefix: this.getStoragePathForAccount(accountId),
      })
    );
  }

  private getStoragePathForAccount(accountId: AccountId): string {
    return `${this.storageCollectionPath}/${accountId}/`;
  }

  private getStoragePath(args: {
    readonly feedItemId: FeedItemId;
    readonly accountId: AccountId;
    readonly filename: string;
  }): string {
    const {feedItemId, accountId, filename} = args;
    const accountPath = this.getStoragePathForAccount(accountId);
    return `${accountPath}${feedItemId}/${filename}`;
  }

  public async importFeedItem(feedItem: FeedItem): AsyncResult<void> {
    const isSafeUrlResult = SharedFeedItemHelpers.validateUrl(feedItem.url);
    if (!isSafeUrlResult.success) {
      return prefixErrorResult(isSafeUrlResult, 'Error validating feed item URL');
    }

    switch (feedItem.type) {
      case FeedItemType.YouTube:
        await this.importYouTubeFeedItem(feedItem);
        break;
      case FeedItemType.Article:
      case FeedItemType.Tweet:
      case FeedItemType.Video:
      case FeedItemType.Website:
        await this.importGenericFeedItem(feedItem);
        break;
      case FeedItemType.Xkcd:
        await this.importXkcdFeedItem(feedItem);
        break;
      default:
        assertNever(feedItem);
    }

    void eventLogService.logFeedItemImportedEvent({
      feedItemId: feedItem.feedItemId,
      accountId: feedItem.accountId,
    });

    return makeSuccessResult(undefined);
  }

  public async importGenericFeedItem(
    feedItem: Exclude<FeedItem, YouTubeFeedItem>
  ): AsyncResult<void> {
    const importAllDataResult = await asyncTryAll([
      this.importFeedItemHtml({
        url: feedItem.url,
        feedItemId: feedItem.feedItemId,
        accountId: feedItem.accountId,
      }),
      this.importFeedItemFirecrawl({
        url: feedItem.url,
        feedItemId: feedItem.feedItemId,
        accountId: feedItem.accountId,
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

  public async importYouTubeFeedItem(feedItem: YouTubeFeedItem): AsyncResult<void> {
    const fetchTranscriptResult = await fetchYouTubeTranscript(feedItem.url);
    if (!fetchTranscriptResult.success) {
      return prefixErrorResult(fetchTranscriptResult, 'Error fetching YouTube transcript');
    }

    const saveTranscriptResult = await this.writeFileToStorage({
      feedItemId: feedItem.feedItemId,
      accountId: feedItem.accountId,
      content: fetchTranscriptResult.value,
      filename: FEED_ITEM_FILE_NAME_TRANSCRIPT,
      contentType: 'text/markdown',
    });

    return prefixResultIfError(saveTranscriptResult, 'Error saving YouTube transcript');
  }

  public async importXkcdFeedItem(feedItem: XkcdFeedItem): AsyncResult<void> {
    const fetchComicResult = await fetchXkcdComic(feedItem.url);
    if (!fetchComicResult.success) {
      return prefixErrorResult(fetchComicResult, 'Error fetching XKCD comic');
    }

    const {title, imageUrl, altText} = fetchComicResult.value;

    const saveTranscriptResult = await asyncTryAll([
      this.writeFileToStorage({
        feedItemId: feedItem.feedItemId,
        accountId: feedItem.accountId,
        content: imageUrl,
        filename: 'xkcdComic.png',
        contentType: 'image/png',
      }),
      this.updateFeedItem(feedItem.feedItemId, {title, xkcd: {imageUrl, altText}}),
    ]);

    const saveTranscriptResultError = saveTranscriptResult.success
      ? saveTranscriptResult.value.results.find((result) => !result.success)?.error
      : saveTranscriptResult.error;
    if (saveTranscriptResultError) {
      return makeErrorResult(prefixError(saveTranscriptResultError, 'Error saving XKCD comic'));
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

    const saveHtmlResult = await this.writeFileToStorage({
      feedItemId,
      accountId,
      content: rawHtml,
      filename: FEED_ITEM_FILE_NAME_HTML,
      contentType: 'text/html',
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

    const fetchDataResult = await this.firecrawlService.fetchUrl(url);

    if (!fetchDataResult.success) {
      return prefixErrorResult(fetchDataResult, 'Error fetching Firecrawl data for feed item');
    }

    const firecrawlData = fetchDataResult.value;

    if (firecrawlData.markdown === null) {
      return makeErrorResult(new Error('Firecrawl data for feed item is missing markdown'));
    }

    const summaryResult = await generateHierarchicalSummary(firecrawlData.markdown);
    if (!summaryResult.success) {
      return prefixErrorResult(summaryResult, 'Error generating hierarchical summary');
    }

    const saveFirecrawlDataResult = await asyncTryAll([
      this.writeFileToStorage({
        feedItemId,
        accountId,
        content: firecrawlData.markdown,
        filename: FEED_ITEM_FILE_NAME_LLM_CONTEXT,
        contentType: 'text/markdown',
      }),
      this.updateFeedItem(feedItemId, {
        outgoingLinks: firecrawlData.links ?? [],
        title: firecrawlData.title ?? 'No title found',
        description: firecrawlData.description ?? 'No description found',
        summary: summaryResult.value,
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
}
