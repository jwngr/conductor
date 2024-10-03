import {addDoc, collection} from 'firebase/firestore';

import {firestore} from './lib/firebase';

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url) {
    try {
      await addDoc(collection(firestore, 'importQueue'), {
        url: tab.url,
        type: 'url',
      });
      console.log('URL saved successfully');
    } catch (error) {
      console.error('Error saving URL:', error);
    }
  }
});
