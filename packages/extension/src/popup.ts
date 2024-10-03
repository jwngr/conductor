import {addDoc, collection} from 'firebase/firestore';

import {firestore} from './lib/firebase';

console.log('Popup script loaded');

document.getElementById('saveButton')?.addEventListener('click', () => {
  console.log('Popup script: save button clicked');
  chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
    const currentTab = tabs[0];
    if (currentTab.id) {
      try {
        await addDoc(collection(firestore, 'importQueue'), {
          url: currentTab.url,
          type: 'url',
        });
        console.log('URL saved successfully');
      } catch (error) {
        console.error('Error saving URL:', error);
      }

      console.log(`Popups script: sending ${currentTab.id}, ${currentTab.url}`);
      chrome.tabs.sendMessage(currentTab.id, {action: 'saveUrl'});
    }
  });
});
