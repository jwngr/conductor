import {feedItemsService} from '@shared/lib/feedItemsServiceInstance';

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url) {
    try {
      await feedItemsService.addFeedItem(tab.url);

      // eslint-disable-next-line no-console
      console.log('URL saved successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving URL:', error);
    }
  }
});
