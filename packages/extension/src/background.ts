import {feedItemsService} from '@shared/services/feedItemsService';
import {FEED_ITEM_EXTENSION_SOURCE} from '@shared/types/feedItems';

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url) {
    try {
      await feedItemsService.addFeedItem({
        url: tab.url,
        source: FEED_ITEM_EXTENSION_SOURCE,
      });

      // eslint-disable-next-line no-console
      console.log('URL saved successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving URL:', error);
    }
  }
});
