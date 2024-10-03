import {addDoc, collection} from 'firebase/firestore';

import {firestore} from './lib/firebase';

const saveButton = document.getElementById('saveButton');
saveButton?.addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
    const currentTab = tabs[0];
    if (!currentTab.id) return;
    try {
      await addDoc(collection(firestore, 'importQueue'), {
        url: currentTab.url,
        type: 'url',
      });
      // eslint-disable-next-line no-console
      console.log('URL saved successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving URL:', error);
    }
  });
});
