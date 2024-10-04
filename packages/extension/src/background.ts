import {addDoc, collection, serverTimestamp} from 'firebase/firestore';

import {firestore} from './lib/firebase';

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url) {
    try {
      await addDoc(collection(firestore, 'importQueue'), {
        url: tab.url,
        type: 'url',
        createdAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
      });
      // eslint-disable-next-line no-console
      console.log('URL saved successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving URL:', error);
    }
  }
});
