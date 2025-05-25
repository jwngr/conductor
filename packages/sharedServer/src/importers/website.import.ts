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

import {extractMainContent, sanitizeHtml} from '@sharedServer/lib/html.server';
import {htmlToMarkdown} from '@sharedServer/lib/markdown.server';
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
   * Extracts the main content from the full page sanitized HTML, converts it to HTML and Markdown,
   * and saves it to storage.
   */
  private async saveMainContentHtmlAndMarkdown(args: {
    readonly url: string;
    readonly html: string;
    readonly feedItemId: FeedItemId;
    readonly accountId: AccountId;
  }): AsyncResult<void> {
    const {url, html, feedItemId, accountId} = args;

    const mainContentResult = await extractMainContent({html, url});
    if (!mainContentResult.success) {
      return prefixErrorResult(mainContentResult, 'Error extracting main content HTML');
    }
    const mainContentData = mainContentResult.value;
    const mainContentHtml = mainContentData.content;

    const mainContentMarkdownResult = htmlToMarkdown(mainContentHtml);
    if (!mainContentMarkdownResult.success) {
      return prefixErrorResult(
        mainContentMarkdownResult,
        'Error converting main content HTML to Markdown'
      );
    }
    const mainContentMarkdown = mainContentMarkdownResult.value;

    const mainContentHtmlStoragePath = this.feedItemService.getStoragePath({
      feedItemId,
      accountId,
      filename: FEED_ITEM_FILE_HTML_DEFUDDLE,
    });

    const mainContentMarkdownPath = this.feedItemService.getStoragePath({
      feedItemId,
      accountId,
      filename: FEED_ITEM_FILE_HTML_MARKDOWN,
    });

    const saveMainContentResult = await asyncTryAll([
      this.feedItemService.writeFileToStorage({
        storagePath: mainContentHtmlStoragePath,
        content: mainContentHtml,
        contentType: 'text/html',
      }),
      this.feedItemService.writeFileToStorage({
        storagePath: mainContentMarkdownPath,
        content: mainContentMarkdown,
        contentType: 'text/markdown',
      }),
    ]);

    if (!saveMainContentResult.success) {
      return prefixErrorResult(saveMainContentResult, 'Error saving main content data');
    }

    const firstError = saveMainContentResult.value.results.find((r) => !r.success)?.error;
    if (firstError) {
      return makeErrorResult(prefixError(firstError, 'Error saving main content file'));
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

    const firecrawlDataResult = await asyncTryAll([
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

    const firecrawlDataResultError = firecrawlDataResult.success
      ? firecrawlDataResult.value.results.find((result) => !result.success)?.error
      : firecrawlDataResult.error;
    if (firecrawlDataResultError) {
      return makeErrorResult(
        prefixError(firecrawlDataResultError, 'Error saving Firecrawl data for feed item')
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

    const [sanitizedHtmlResult, firecrawlDataResult] = importAllDataResult.value.results;

    // Consider failing to fetch the Firecrawl data as recoverable, so just log.
    if (!firecrawlDataResult.success) {
      logger.error(firecrawlDataResult.error, {feedItemId, accountId});
    }

    // Consider failing to fetch the raw HTML as unrecoverable. Logging will happen at the next
    // level up.
    if (!sanitizedHtmlResult.success) return sanitizedHtmlResult;
    const sanitizedHtml = sanitizedHtmlResult.value;

    const saveMainContentResult = await this.saveMainContentHtmlAndMarkdown({
      url,
      html: sanitizedHtml,
      feedItemId,
      accountId,
    });

    if (!saveMainContentResult.success) return saveMainContentResult;

    return makeSuccessResult(undefined);
  }
}
