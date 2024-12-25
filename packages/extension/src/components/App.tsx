import {useState} from 'react';

import {asyncTry} from '@shared/lib/errorUtils.shared';

import {FEED_ITEM_APP_SOURCE} from '@shared/types/feedItems.types';

import {useFeedItemsService} from '@sharedClient/services/feedItems.client';

import {useCurrentTab} from '@src/lib/tabs.ext';

function App() {
  const [status, setStatus] = useState<string>('');
  const {currentTab} = useCurrentTab();
  const feedItemsService = useFeedItemsService();

  const handleClick = async () => {
    setStatus('Saving URL...');

    const tabResult = await asyncTry(async () => {
      const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
      return tab;
    });

    if (!tabResult.success) {
      setStatus(`Error getting tab: ${tabResult.error.message}`);
      return;
    }
    const tab = tabResult.value;

    const tabUrl = tab.url;
    if (!tabUrl) {
      setStatus('Error saving URL: No URL found for tab');
      return;
    }

    const addFeedItemResult = await feedItemsService.addFeedItem({
      url: tabUrl,
      source: FEED_ITEM_APP_SOURCE,
    });

    if (addFeedItemResult.success) {
      setStatus('URL saved successfully!');
    } else {
      setStatus(`Error saving URL: ${addFeedItemResult.error.message}`);
    }
  };

  return (
    <>
      <p>URL: {currentTab?.url}</p>
      <button id="saveButton" onClick={handleClick}>
        Save Current URL
      </button>
      <p>{status}</p>
    </>
  );
}

export default App;
