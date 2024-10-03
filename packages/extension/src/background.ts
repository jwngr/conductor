import {addDoc, collection} from 'firebase/firestore';

import {firestore} from './lib/firebase';

console.log('Background script loaded');

chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked');
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
  console.log('Extension action done');
});
