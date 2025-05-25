import {Defuddle} from 'defuddle/node';

import {logger} from '@shared/services/logger.shared';

import {
  FEED_ITEM_FILE_HTML,
  FEED_ITEM_FILE_HTML_DEFUDDLE,
  FEED_ITEM_FILE_HTML_MARKDOWN,
  FEED_ITEM_FILE_LLM_CONTEXT,
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
  FeedItemId,
  FeedItemWithUrl,
  XkcdFeedItem,
  YouTubeFeedItem,
} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import type {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';

import {sanitizeHtml} from '@sharedServer/lib/html.server';
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
   * Imports a feed item's raw HTML, sanitizes it, and saves it to storage.
   */
  private async fetchAndSaveSanitizedHtml(args: {
    readonly url: string;
    readonly feedItemId: FeedItemId;
    readonly accountId: AccountId;
  }): AsyncResult<string> {
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

    const sanitizedHtmlResult = sanitizeHtml(rawHtml);
    if (!sanitizedHtmlResult.success) {
      return prefixErrorResult(sanitizedHtmlResult, 'Error sanitizing feed item HTML');
    }
    const sanitizedHtml = sanitizedHtmlResult.value;

    const storagePath = this.feedItemService.getStoragePath({
      feedItemId,
      accountId,
      filename: FEED_ITEM_FILE_HTML,
    });
    const saveHtmlResult = await this.feedItemService.writeFileToStorage({
      storagePath,
      content: sanitizedHtml,
      contentType: 'text/html',
    });

    if (!saveHtmlResult.success) return saveHtmlResult;

    return makeSuccessResult(sanitizedHtml);
  }

  /**
   * Uses Defuddle to extract clean HTML and Markdown and saves it to storage.
   */
  private async saveDefuddleData(args: {
    readonly url: string;
    readonly rawHtml: string;
    readonly feedItemId: FeedItemId;
    readonly accountId: AccountId;
  }): AsyncResult<void> {
    const {url, rawHtml, feedItemId, accountId} = args;

    const defuddleData = await Defuddle(rawHtml, url, {
      url,
      debug: true,
      markdown: true,
      separateMarkdown: true,
      removeExactSelectors: true,
      removePartialSelectors: true,
    });

    console.log('+++ defuddleData keys', Object.keys(defuddleData));

    const defuddleHtmlStoragePath = this.feedItemService.getStoragePath({
      feedItemId,
      accountId,
      filename: FEED_ITEM_FILE_HTML_DEFUDDLE,
    });

    const defuddleMarkdownPath = this.feedItemService.getStoragePath({
      feedItemId,
      accountId,
      filename: FEED_ITEM_FILE_HTML_MARKDOWN,
    });

    const saveDefuddleDataResult = await asyncTryAll([
      this.feedItemService.writeFileToStorage({
        storagePath: defuddleHtmlStoragePath,
        content: defuddleData.content,
        contentType: 'text/html',
      }),
      defuddleData.contentMarkdown
        ? this.feedItemService.writeFileToStorage({
            storagePath: defuddleMarkdownPath,
            content: defuddleData.contentMarkdown as string,
            contentType: 'text/markdown',
          })
        : Promise.resolve(makeErrorResult(new Error('Received no markdown content from Defuddle'))),
    ]);

    if (!saveDefuddleDataResult.success) {
      return prefixErrorResult(saveDefuddleDataResult, 'Error saving Defuddle data');
    }

    const firstError = saveDefuddleDataResult.value.results.find((r) => !r.success)?.error;
    if (firstError) {
      return makeErrorResult(prefixError(firstError, 'Error saving Defuddle file'));
    }

    return makeSuccessResult(undefined);
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
      filename: FEED_ITEM_FILE_LLM_CONTEXT,
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
    feedItem: Exclude<FeedItemWithUrl, YouTubeFeedItem | XkcdFeedItem>
  ): AsyncResult<void> {
    const {url, feedItemId, accountId} = feedItem;

    const importAllDataResult = await asyncTryAll([
      this.fetchAndSaveSanitizedHtml({
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
    if (!importAllDataResult.success) {
      return makeErrorResult(prefixError(importAllDataResult.error, 'Error importing feed item'));
    }

    const [saveRawHtmlResult, saveFirecrawlDataResult] = importAllDataResult.value.results;

    // Consider failing to fetch the raw HTML as unrecoverable.
    if (!saveRawHtmlResult.success) return saveRawHtmlResult;

    // Consider failing to fetch the Firecrawl data as recoverable.
    if (!saveFirecrawlDataResult.success) {
      logger.error(saveFirecrawlDataResult.error, {feedItemId, accountId});
    }

    const saveDefuddleResult = await this.saveDefuddleData({
      url,
      rawHtml: saveRawHtmlResult.value,
      feedItemId,
      accountId,
    });

    if (!saveDefuddleResult.success) return saveDefuddleResult;

    return makeSuccessResult(undefined);
  }
}
