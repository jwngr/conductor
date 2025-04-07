import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';

import {FeedItemImportStatus} from '@shared/types/feedItems.types';
import type {FeedItem} from '@shared/types/feedItems.types';
import {makeSuccessResult, type AsyncResult, type ErrorResult} from '@shared/types/result.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';

export async function feedItemImportHelper(args: {
  readonly feedItem: FeedItem;
  readonly feedItemsService: ServerFeedItemsService;
}): AsyncResult<void> {
  const {feedItem, feedItemsService} = args;
  const feedItemId = feedItem.feedItemId;
  const logDetails = {feedItemId, accountId: feedItem.accountId} as const;

  const handleError = async (
    errorResult: ErrorResult<Error>,
    errorPrefix: string
  ): Promise<ErrorResult<Error>> => {
    await feedItemsService.updateFeedItem(feedItemId, {
      importState: {
        status: FeedItemImportStatus.Failed,
        errorMessage: errorResult.error.message,
        importFailedTime: new Date(),
        lastImportRequestedTime: feedItem.importState.lastImportRequestedTime,
        lastSuccessfulImportTime: feedItem.importState.lastSuccessfulImportTime,
        // Don't retry failed imports. Users can manually retry from the UI.
        shouldFetch: false,
      },
    });
    return prefixErrorResult(errorResult, errorPrefix);
  };

  // Claim the item so that no other function picks it up.
  // TODO: Consider using a lock to prevent multiple functions from processing the same item.
  logger.log(`[IMPORT] Claiming import queue item...`, logDetails);
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
    return handleError(claimItemResult, 'Failed to claim import queue item');
  }

  // Actually import the feed item.
  logger.log(`[IMPORT] Importing queue item...`, logDetails);
  const importItemResult = await feedItemsService.importFeedItem(feedItem);
  if (!importItemResult.success) {
    return handleError(importItemResult, 'Error importing queue item');
  }

  // Mark the import queue item as completed once everything else has processed successfully.
  logger.log(`[IMPORT] Marking import queue item as completed...`, logDetails);
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
    return handleError(markCompletedResult, 'Failed to mark import queue item as completed');
  }

  return makeSuccessResult(undefined);
}
