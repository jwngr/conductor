import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {XkcdFeedItem} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';

import {fetchXkcdComic} from '@sharedServer/lib/xkcd.server';

export class XkcdFeedItemImporter {
  private readonly feedItemService: ServerFeedItemsService;

  constructor(args: {readonly feedItemService: ServerFeedItemsService}) {
    this.feedItemService = args.feedItemService;
  }

  public async import(feedItem: XkcdFeedItem): AsyncResult<void> {
    const fetchComicResult = await fetchXkcdComic(feedItem.url);
    if (!fetchComicResult.success) {
      return prefixErrorResult(fetchComicResult, 'Error fetching XKCD comic');
    }

    const {title, imageUrlSmall, imageUrlLarge, altText} = fetchComicResult.value;

    const updateFeedItemResult = await this.feedItemService.updateFeedItem(feedItem.feedItemId, {
      title,
      xkcd: {imageUrlSmall, imageUrlLarge, altText},
    });
    return prefixResultIfError(updateFeedItemResult, 'Error updating XKCD comic');
  }
}
