import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {FeedItemImportStatus} from '@shared/types/feedItems.types';
import type {FeedItem} from '@shared/types/feedItems.types';
import type {AsyncResult, ErrorResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';

/**
 * Imports a feed item, importing content and doing some LLM processing.
 */
export async function handleFeedItemImport(args: {
  readonly feedItem: FeedItem;
  readonly feedItemsService: ServerFeedItemsService;
}): AsyncResult<void> {
  const {feedItem, feedItemsService} = args;
  const feedItemId = feedItem.feedItemId;

  const handleError = async (
    errorResult: ErrorResult<Error>,
    errorPrefix: string
  ): Promise<ErrorResult<Error>> => {
    const betterErrorResult = prefixErrorResult(errorResult, errorPrefix);
    await feedItemsService.updateFeedItem(feedItemId, {
      importState: {
        status: FeedItemImportStatus.Failed,
        errorMessage: betterErrorResult.error.message,
        importFailedTime: new Date(),
        lastImportRequestedTime: feedItem.importState.lastImportRequestedTime,
        lastSuccessfulImportTime: feedItem.importState.lastSuccessfulImportTime,
        // Don't retry failed imports. Users can manually retry from the UI.
        shouldFetch: false,
      },
    });
    return betterErrorResult;
  };

  // Claim the item so that no other function picks it up.
  // TODO: Consider using a lock to prevent multiple functions from processing the same item.
  const claimItemResult = await feedItemsService.updateFeedItem(feedItemId, {
    importState: {
      status: FeedItemImportStatus.Processing,
      importStartedTime: new Date(),
      lastImportRequestedTime: feedItem.importState.lastImportRequestedTime,
      lastSuccessfulImportTime: feedItem.importState.lastSuccessfulImportTime,
      // Claiming the item means we don't need to fetch it again.
      shouldFetch: false,
    },
  });
  if (!claimItemResult.success) {
    return handleError(claimItemResult, 'Failed to claim feed item to import');
  }

  // Actually import the feed item.
  const importItemResult = await feedItemsService.importFeedItem(feedItem);
  if (!importItemResult.success) {
    return handleError(importItemResult, 'Failed to import feed item');
  }

  // Mark the feed item as completed once everything else has processed successfully.
  const markCompletedResult = await feedItemsService.updateFeedItem(feedItemId, {
    importState: {
      status: FeedItemImportStatus.Completed,
      lastSuccessfulImportTime: new Date(),
      lastImportRequestedTime: feedItem.importState.lastImportRequestedTime,
      // Completed items don't need to be fetched again.
      shouldFetch: false,
    },
  });
  if (!markCompletedResult.success) {
    return handleError(markCompletedResult, 'Failed to mark feed item as completed');
  }

  return makeSuccessResult(undefined);
}
