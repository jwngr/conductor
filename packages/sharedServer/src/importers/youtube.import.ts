import {FEED_ITEM_FILE_NAME_TRANSCRIPT} from '@shared/lib/constants.shared';
import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {YouTubeFeedItem} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';

import {fetchYouTubeTranscript} from '@sharedServer/lib/youtube.server';

export class YouTubeFeedItemImporter {
  private readonly feedItemService: ServerFeedItemsService;

  constructor(args: {readonly feedItemService: ServerFeedItemsService}) {
    this.feedItemService = args.feedItemService;
  }

  public async import(feedItem: YouTubeFeedItem): AsyncResult<void> {
    const fetchTranscriptResult = await fetchYouTubeTranscript(feedItem.url);
    if (!fetchTranscriptResult.success) {
      return prefixErrorResult(fetchTranscriptResult, 'Error fetching YouTube transcript');
    }

    const saveTranscriptResult = await this.feedItemService.writeFileToStorage({
      storagePath: this.feedItemService.getStoragePath({
        feedItemId: feedItem.feedItemId,
        accountId: feedItem.accountId,
        filename: FEED_ITEM_FILE_NAME_TRANSCRIPT,
      }),
      content: fetchTranscriptResult.value,
      contentType: 'text/markdown',
    });

    return prefixResultIfError(saveTranscriptResult, 'Error saving YouTube transcript');
  }
}
