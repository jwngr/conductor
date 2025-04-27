import {FEED_ITEM_FILE_NAME_XKCD_EXPLAIN} from '@shared/lib/constants.shared';
import {asyncTryAll, prefixError, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {FeedItem, XkcdFeedItem} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import type {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';

import {
  fetchXkcdComic,
  makeExplainXkcdUrl,
  parseXkcdComicIdFromUrl,
} from '@sharedServer/lib/xkcd.server';

export class XkcdFeedItemImporter {
  private readonly feedItemService: ServerFeedItemsService;
  private readonly firecrawlService: ServerFirecrawlService;

  constructor(args: {
    readonly feedItemService: ServerFeedItemsService;
    readonly firecrawlService: ServerFirecrawlService;
  }) {
    this.feedItemService = args.feedItemService;
    this.firecrawlService = args.firecrawlService;
  }

  public async fetchAndSaveXkcdComic(args: {
    readonly comicId: number;
    readonly feedItem: FeedItem;
  }): AsyncResult<void> {
    const {comicId, feedItem} = args;

    const fetchXkcdComicResult = await fetchXkcdComic(comicId);
    if (!fetchXkcdComicResult.success) return fetchXkcdComicResult;

    const {title, imageUrlSmall, imageUrlLarge, altText} = fetchXkcdComicResult.value;

    const updateFeedItemResult = await this.feedItemService.updateFeedItem(feedItem.feedItemId, {
      title,
      xkcd: {imageUrlSmall, imageUrlLarge, altText},
    });
    return prefixResultIfError(updateFeedItemResult, 'Error updating XKCD comic');
  }

  // public async fetchAndSaveExplainXkcdContent(args: {
  //   readonly comicId: number;
  //   readonly feedItem: FeedItem;
  // }): AsyncResult<void> {
  //   const {comicId, feedItem} = args;

  //   const fetchExplainXkcdContentResult = await fetchExplainXkcdContent(comicId);
  //   if (!fetchExplainXkcdContentResult.success) return fetchExplainXkcdContentResult;

  //   const content = fetchExplainXkcdContentResult.value;

  //   const storagePath = this.feedItemService.getStoragePath({
  //     feedItemId: feedItem.feedItemId,
  //     accountId: feedItem.accountId,
  //     filename: FEED_ITEM_FILE_NAME_XKCD_EXPLAIN,
  //   });

  //   const saveExplainXkcdContentResult = await this.feedItemService.writeFileToStorage({
  //     storagePath,
  //     content,
  //     contentType: 'text/markdown',
  //   });

  //   return prefixResultIfError(saveExplainXkcdContentResult, 'Error saving XKCD explain content');
  // }

  private async fetchAndSaveFirecrawlData(args: {
    readonly comicId: number;
    readonly feedItem: FeedItem;
  }): AsyncResult<void> {
    const {comicId, feedItem} = args;

    const url = makeExplainXkcdUrl(comicId);
    const fetchDataResult = await this.firecrawlService.fetchUrl(url);
    if (!fetchDataResult.success) return fetchDataResult;

    const firecrawlData = fetchDataResult.value;

    const storagePath = this.feedItemService.getStoragePath({
      feedItemId: feedItem.feedItemId,
      accountId: feedItem.accountId,
      filename: FEED_ITEM_FILE_NAME_XKCD_EXPLAIN,
    });

    const saveExplainXkcdContentResult = await this.feedItemService.writeFileToStorage({
      storagePath,
      content: firecrawlData.markdown,
      contentType: 'text/markdown',
    });

    return prefixResultIfError(
      saveExplainXkcdContentResult,
      'Error saving XKCD explain content via Firecrawl'
    );
  }

  public async import(feedItem: XkcdFeedItem): AsyncResult<void> {
    const comicIdResult = parseXkcdComicIdFromUrl(feedItem.url);
    if (!comicIdResult.success) return comicIdResult;

    const comicId = comicIdResult.value;
    const fetchXkcdResults = await asyncTryAll([
      this.fetchAndSaveXkcdComic({comicId, feedItem}),
      this.fetchAndSaveFirecrawlData({comicId, feedItem}),
    ]);
    const fetchXkcdResultsError = fetchXkcdResults.success
      ? fetchXkcdResults.value.results.find((result) => !result.success)?.error
      : fetchXkcdResults.error;
    if (fetchXkcdResultsError) {
      return makeErrorResult(prefixError(fetchXkcdResultsError, 'Error fetching XKCD data'));
    }

    return makeSuccessResult(undefined);
  }
}
