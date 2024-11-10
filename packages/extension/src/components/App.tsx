import {useState} from 'react';

import {asyncTry} from '@shared/lib/errors';

import {feedItemsService} from '@shared/services/feedItemsService';

import {FEED_ITEM_APP_SOURCE} from '@shared/types/feedItems.types';
import {createUserId} from '@shared/types/user.types';

import {useCurrentTab} from '@src/lib/tabs';

function App() {
  const [status, setStatus] = useState<string>('');
  const {currentTab} = useCurrentTab();

  const handleClick = async () => {
    setStatus('Saving URL...');

    const tabResult = await asyncTry<chrome.tabs.Tab>(async () => {
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

    // TODO: Get the user ID from the extension's auth once it's implemented.
    const userIdResult = createUserId('TODO');
    if (!userIdResult.success) {
      setStatus(`Error creating user ID: ${userIdResult.error.message}`);
      return;
    }
    const userId = userIdResult.value;

    const addFeedItemResult = await feedItemsService.addFeedItem({
      url: tabUrl,
      source: FEED_ITEM_APP_SOURCE,
      userId,
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
