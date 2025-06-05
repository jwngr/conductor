import {FEED_ITEM_FILE_XKCD_EXPLAIN} from '@shared/lib/constants.shared';
import {asyncTryAll, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {parseXkcdComicIdFromUrl} from '@shared/lib/xkcd.shared';

import type {XkcdFeedItem} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';

import {fetchExplainXkcdContent, fetchXkcdComic} from '@sharedServer/lib/xkcd.server';

export class XkcdFeedItemImporter {
  private readonly feedItemService: ServerFeedItemsService;

  constructor(args: {readonly feedItemService: ServerFeedItemsService}) {
    this.feedItemService = args.feedItemService;
  }

  public async fetchAndSaveXkcdComic(args: {
    readonly comicId: number;
    readonly feedItem: XkcdFeedItem;
  }): AsyncResult<void> {
    const {comicId, feedItem} = args;

    const fetchXkcdComicResult = await fetchXkcdComic(comicId);
    if (!fetchXkcdComicResult.success) return fetchXkcdComicResult;

    const {title, imageUrlSmall, imageUrlLarge, altText} = fetchXkcdComicResult.value;

    const updateFeedItemResult = await this.feedItemService.updateXkcdFeedItemContent(
      feedItem.feedItemId,
      {
        title,
        imageUrlSmall,
        imageUrlLarge,
        altText,
      }
    );
    return prefixResultIfError(updateFeedItemResult, 'Error updating XKCD comic');
  }

  public async fetchAndSaveExplainXkcdContent(args: {
    readonly comicId: number;
    readonly feedItem: XkcdFeedItem;
  }): AsyncResult<void> {
    const {comicId, feedItem} = args;

    const fetchExplainXkcdContentResult = await fetchExplainXkcdContent(comicId);
    if (!fetchExplainXkcdContentResult.success) return fetchExplainXkcdContentResult;

    const content = fetchExplainXkcdContentResult.value;

    const storagePath = this.feedItemService.getStoragePath({
      feedItemId: feedItem.feedItemId,
      accountId: feedItem.accountId,
      filename: FEED_ITEM_FILE_XKCD_EXPLAIN,
    });

    const saveExplainXkcdContentResult = await this.feedItemService.writeFileToStorage({
      storagePath,
      content: content.explanationMarkdown,
      contentType: 'text/markdown',
    });

    // TODO: Also save transcript if it exists.

    return prefixResultIfError(saveExplainXkcdContentResult, 'Error saving XKCD explain content');
  }

  public async import(feedItem: XkcdFeedItem): AsyncResult<void> {
    const comicIdResult = parseXkcdComicIdFromUrl(feedItem.url);
    if (!comicIdResult.success) return comicIdResult;

    const comicId = comicIdResult.value;
    const fetchXkcdResults = await asyncTryAll([
      this.fetchAndSaveXkcdComic({comicId, feedItem}),
      this.fetchAndSaveExplainXkcdContent({comicId, feedItem}),
    ]);
    const fetchXkcdErrorResult = fetchXkcdResults.success
      ? fetchXkcdResults.value.results.find((result) => !result.success)
      : fetchXkcdResults;
    if (fetchXkcdErrorResult) {
      return prefixErrorResult(fetchXkcdErrorResult, 'Error fetching XKCD data');
    }

    return makeSuccessResult(undefined);
  }
}
