import {
  FEED_ITEM_FILE_NAME_HTML,
  FEED_ITEM_FILE_NAME_LLM_CONTEXT,
} from '@shared/lib/constants.shared';
import {
  asyncTryAll,
  prefixError,
  prefixErrorResult,
  prefixResultIfError,
} from '@shared/lib/errorUtils.shared';
import {requestGet} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {
  FeedItem,
  FeedItemId,
  XkcdFeedItem,
  YouTubeFeedItem,
} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import type {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';

import {generateHierarchicalSummary} from '@sharedServer/lib/summarization.server';

export class WebsiteFeedItemImporter {
  private readonly feedItemService: ServerFeedItemsService;
  private readonly firecrawlService: ServerFirecrawlService;

  constructor(args: {
    readonly feedItemService: ServerFeedItemsService;
    readonly firecrawlService: ServerFirecrawlService;
  }) {
    this.feedItemService = args.feedItemService;
    this.firecrawlService = args.firecrawlService;
  }

  /**
   * Imports a feed item's HTML and saves it to storage.
   */
  private async fetchAndSaveRawHtml(args: {
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
      headers: {Accept: 'text/html'},
    });

    if (!fetchDataResult.success) {
      return prefixErrorResult(fetchDataResult, 'Error fetching raw feed item HTML');
    }

    const rawHtml = fetchDataResult.value;

    const storagePath = this.feedItemService.getStoragePath({
      feedItemId,
      accountId,
      filename: FEED_ITEM_FILE_NAME_HTML,
    });
    const saveHtmlResult = await this.feedItemService.writeFileToStorage({
      storagePath,
      content: rawHtml,
      contentType: 'text/html',
    });

    return prefixResultIfError(saveHtmlResult, 'Error saving feed item HTML');
  }

  /**
   * Imports a feed item's Firecrawl data and saves it to storage.
   */
  private async fetchAndSaveFirecrawlData(args: {
    readonly url: string;
    readonly feedItemId: FeedItemId;
    readonly accountId: AccountId;
  }): AsyncResult<void> {
    const {url, feedItemId, accountId} = args;

    const fetchDataResult = await this.firecrawlService.fetchUrl(url);
    if (!fetchDataResult.success) return fetchDataResult;

    const firecrawlData = fetchDataResult.value;

    const storagePath = this.feedItemService.getStoragePath({
      feedItemId,
      accountId,
      filename: FEED_ITEM_FILE_NAME_LLM_CONTEXT,
    });

    const saveFirecrawlDataResult = await asyncTryAll([
      this.feedItemService.writeFileToStorage({
        storagePath,
        content: firecrawlData.markdown,
        contentType: 'text/markdown',
      }),
      this.feedItemService.updateFeedItem(feedItemId, {
        outgoingLinks: firecrawlData.links,
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

    return await this.generateAndSaveHierarchicalSummary({
      markdown: firecrawlData.markdown,
      feedItemId,
    });
  }

  /**
   * Imports a feed item's Firecrawl data and saves it to storage.
   */
  private async generateAndSaveHierarchicalSummary(args: {
    readonly markdown: string;
    readonly feedItemId: FeedItemId;
  }): AsyncResult<void> {
    const {markdown, feedItemId} = args;

    const summaryResult = await generateHierarchicalSummary(markdown);
    if (!summaryResult.success) return summaryResult;

    const saveSummaryResult = await this.feedItemService.updateFeedItem(feedItemId, {
      summary: summaryResult.value,
    });

    return prefixResultIfError(saveSummaryResult, 'Error saving hierarchical summary');
  }

  public async import(
    feedItem: Exclude<FeedItem, YouTubeFeedItem | XkcdFeedItem>
  ): AsyncResult<void> {
    const importAllDataResult = await asyncTryAll([
      this.fetchAndSaveRawHtml({
        url: feedItem.url,
        feedItemId: feedItem.feedItemId,
        accountId: feedItem.accountId,
      }),
      this.fetchAndSaveFirecrawlData({
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
}
