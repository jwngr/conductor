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
    try {
      await addDoc(collection(firestore, 'importQueue'), {
        url: tab.url,
        type: 'url',
        createdAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
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
