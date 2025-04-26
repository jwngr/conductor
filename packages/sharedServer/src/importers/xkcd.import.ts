import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {XkcdFeedItem} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {UpdateFeedItemFn} from '@sharedServer/services/feedItems.server';

import {fetchXkcdComic} from '@sharedServer/lib/xkcd.server';

export class XkcdFeedItemImporter {
  private readonly updateFeedItem: UpdateFeedItemFn;

  constructor(args: {readonly updateFeedItem: UpdateFeedItemFn}) {
    this.updateFeedItem = args.updateFeedItem;
  }

  public async import(feedItem: XkcdFeedItem): AsyncResult<void> {
    const fetchComicResult = await fetchXkcdComic(feedItem.url);
    if (!fetchComicResult.success) {
      return prefixErrorResult(fetchComicResult, 'Error fetching XKCD comic');
    }

    const {title, imageUrlSmall, imageUrlLarge, altText} = fetchComicResult.value;

    const updateFeedItemResult = await this.updateFeedItem(feedItem.feedItemId, {
      title,
      xkcd: {imageUrlSmall, imageUrlLarge, altText},
    });
    return prefixResultIfError(updateFeedItemResult, 'Error updating XKCD comic');
  }
}
