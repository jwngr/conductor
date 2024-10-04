import {ImportQueueItem, SavedItem} from '@shared/types';
import {addDoc, collection, serverTimestamp} from 'firebase/firestore';
import {useState} from 'react';

import {firestore} from '../lib/firebase';
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
      const newItem: Omit<SavedItem, 'id'> = {
        url: tab.url,
        isSaved: true,
        source: 'extension',
        createdAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
        isImporting: true,
      };

      const newItemDocRef = await addDoc(collection(firestore, 'items'), newItem);

      const importQueueItem: ImportQueueItem = {
        url: tab.url,
        itemId: newItemDocRef.id,
        createdAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, 'importQueue'), importQueueItem);

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
