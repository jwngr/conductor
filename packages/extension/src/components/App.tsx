import {useState} from 'react';

import {feedItemsService} from '@shared/services/feedItemsService';

import {FEED_ITEM_APP_SOURCE} from '@shared/types/feedItems.types';
import {createUserId} from '@shared/types/user.types';

import {useCurrentTab} from '@src/lib/tabs';

function App() {
  const [status, setStatus] = useState<string>('');
  const {currentTab} = useCurrentTab();

  const handleClick = async () => {
    setStatus('Pending...');
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

    if (!tab.url) {
      setStatus('Error: No URL found');
      return;
    }

    // TODO: Get the user ID from the extension's auth once it's implemented.
    const userIdResult = createUserId('TODO');
    if (!userIdResult.success) {
      setStatus(`Error: ${userIdResult.error.message}`);
      return;
    }
    const userId = userIdResult.value;

    try {
      await feedItemsService.addFeedItem({
        url: tab.url,
        source: FEED_ITEM_APP_SOURCE,
        userId,
      });

      setStatus('URL saved successfully');
    } catch (error) {
      setStatus(`Error: ${error}`);
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
