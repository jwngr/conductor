import {addDoc, collection, doc, setDoc} from 'firebase/firestore';

import {FEED_ITEMS_COLLECTION, IMPORT_QUEUE_COLLECTION} from '@shared/lib/constants';
import {makeFeedItem} from '@shared/lib/feedItems';
import {firestore} from '@shared/lib/firebase';
import {makeImportQueueItem} from '@shared/lib/importQueue';

const newItemsCollectionRef = collection(firestore, FEED_ITEMS_COLLECTION);
const importQueueCollectionRef = collection(firestore, IMPORT_QUEUE_COLLECTION);

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url) {
    try {
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
