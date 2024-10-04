import {ImportQueueItem, SavedItem} from '@shared/types';
import {addDoc, collection, serverTimestamp} from 'firebase/firestore';

import {firestore} from './lib/firebase';

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url) {
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

      // eslint-disable-next-line no-console
      console.log('URL saved successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving URL:', error);
    }
  }
});
