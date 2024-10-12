import {addDoc, collection, doc, setDoc} from 'firebase/firestore';
import {useState} from 'react';

import {FEED_ITEM_COLLECTION, IMPORT_QUEUE_COLLECTION} from '@shared/lib/constants';
import {makeImportQueueItem} from '@shared/lib/importQueue';
import {makeFeedItem} from '@shared/lib/items';

import {firestore} from '@src/lib/firebase';

import {useCurrentTab} from '../lib/tabs';

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

    try {
      const newItemsCollectionRef = collection(firestore, FEED_ITEM_COLLECTION);
      const importQueueCollectionRef = collection(firestore, IMPORT_QUEUE_COLLECTION);

      const feedItem = makeFeedItem(tab.url, newItemsCollectionRef);
      const importQueueItem = makeImportQueueItem(tab.url, feedItem.itemId);

      await Promise.all([
        setDoc(doc(newItemsCollectionRef, feedItem.itemId), feedItem),
        addDoc(importQueueCollectionRef, importQueueItem),
      ]);

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
