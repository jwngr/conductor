import {logger} from '@shared/lib/logger';

import {feedItemsService} from '@shared/services/feedItemsService';

import {FEED_ITEM_EXTENSION_SOURCE} from '@shared/types/feedItems.types';
import {createUserId} from '@shared/types/user.types';

chrome.action.onClicked.addListener(async (tab) => {
  // TODO: Get the user ID from the extension's auth once it's implemented.
  const userIdResult = createUserId('TODO');
  if (!userIdResult.success) {
    logger.error('Error getting user ID:', {error: userIdResult.error});
    return;
  }
  const userId = userIdResult.value;

  const tabUrl = tab.url;
  if (!tabUrl) {
    // eslint-disable-next-line no-console
    console.error('No URL found for tab');
    return;
  }

  const addFeedItemResult = await feedItemsService.addFeedItem({
    url: tabUrl,
    source: FEED_ITEM_EXTENSION_SOURCE,
    userId,
  });

  if (!addFeedItemResult.success) {
    logger.error('Error saving URL:', {error: addFeedItemResult.error, userId});
    return;
  }

  logger.log('URL saved successfully!', {userId});
});
