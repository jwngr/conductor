import {FEED_ITEM_FILE_NAME_TRANSCRIPT} from '@shared/lib/constants.shared';
import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {YouTubeFeedItem} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {GetStoragePathFn, WriteFileToStorageFn} from '@sharedServer/services/feedItems.server';

import {fetchYouTubeTranscript} from '@sharedServer/lib/youtube.server';

export class YouTubeFeedItemImporter {
  private readonly getStoragePath: GetStoragePathFn;
  private readonly writeFileToStorage: WriteFileToStorageFn;

  constructor(args: {
    readonly getStoragePath: GetStoragePathFn;
    readonly writeFileToStorage: WriteFileToStorageFn;
  }) {
    this.getStoragePath = args.getStoragePath;
    this.writeFileToStorage = args.writeFileToStorage;
  }

  public async import(feedItem: YouTubeFeedItem): AsyncResult<void> {
    const fetchTranscriptResult = await fetchYouTubeTranscript(feedItem.url);
    if (!fetchTranscriptResult.success) {
      return prefixErrorResult(fetchTranscriptResult, 'Error fetching YouTube transcript');
    }

    const saveTranscriptResult = await this.writeFileToStorage({
      storagePath: this.getStoragePath({
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
