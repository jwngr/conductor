import {addDoc, collection, doc, setDoc} from 'firebase/firestore';

import {FEED_ITEM_COLLECTION, IMPORT_QUEUE_COLLECTION} from '@shared/lib/constants';
import {makeImportQueueItem} from '@shared/lib/importQueue';
import {makeFeedItem} from '@shared/lib/items';

import {firestore} from '@src/lib/firebase';

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url) {
    try {
      const newItemsCollectionRef = collection(firestore, FEED_ITEM_COLLECTION);
      const importQueueCollectionRef = collection(firestore, IMPORT_QUEUE_COLLECTION);

      const feedItem = makeFeedItem(tab.url, newItemsCollectionRef);
      const importQueueItem = makeImportQueueItem(tab.url, feedItem.itemId);

      await Promise.all([
        setDoc(doc(newItemsCollectionRef, feedItem.itemId), feedItem),
        addDoc(importQueueCollectionRef, importQueueItem),
      ]);

      // eslint-disable-next-line no-console
      console.log('URL saved successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving URL:', error);
    }
  }
});
