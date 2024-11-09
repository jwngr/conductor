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

  if (tab.url) {
    try {
      await feedItemsService.addFeedItem({
        url: tab.url,
        source: FEED_ITEM_EXTENSION_SOURCE,
        userId,
      });

      // eslint-disable-next-line no-console
      console.log('URL saved successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving URL:', error);
    }
  }
});
