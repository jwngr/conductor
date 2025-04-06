import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseFeedItem, parseFeedItemId} from '@shared/parsers/feedItems.parser';

import type {ServerImportQueueService} from '@sharedServer/services/importQueue.server';

export async function createImportQueueItemHelper(args: {
  readonly feedItemId: string;
  readonly data: unknown;
  readonly importQueueService: ServerImportQueueService;
  // TODO: Use AsyncResult here.
}): Promise<void> {
  const {feedItemId, data, importQueueService} = args;

  const feedItemIdResult = parseFeedItemId(feedItemId);
  if (!feedItemIdResult.success) {
    const betterError = prefixError(feedItemIdResult.error, 'Failed to parse feed item ID');
    logger.error(betterError, {feedItemId});
    return;
  }

  const feedItemData = data;
  if (!feedItemData) {
    logger.error(new Error('No feed item data found'), {feedItemId: feedItemIdResult.value});
    return;
  }

  const feedItemResult = parseFeedItem(feedItemData);
  if (!feedItemResult.success) {
    const betterError = prefixError(feedItemResult.error, 'Failed to parse feed item');
    logger.error(betterError, {feedItemId: feedItemIdResult.value, feedItemData});
    return;
  }

  const feedItem = feedItemResult.value;

  const createImportQueueItemResult = await importQueueService.create({
    feedItemId: feedItem.feedItemId,
    accountId: feedItem.accountId,
    url: feedItem.url,
  });

  if (!createImportQueueItemResult.success) {
    const betterError = prefixError(
      createImportQueueItemResult.error,
      'Failed to create import queue item'
    );
    logger.error(betterError, {feedItemId: feedItem.feedItemId});
    return;
  }

  logger.log('Successfully created import queue item', {
    feedItemId: feedItem.feedItemId,
    importQueueItemId: createImportQueueItemResult.value.importQueueItemId,
  });
}
