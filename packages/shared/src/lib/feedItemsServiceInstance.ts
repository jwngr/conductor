import {collection} from 'firebase/firestore';
import {ref as storageRef} from 'firebase/storage';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  IMPORT_QUEUE_COLLECTION,
} from './constants';
import {FeedItemsService} from './feedItems';
import {firestore, storage} from './firebase';

const feedItemsDbRef = collection(firestore, FEED_ITEMS_DB_COLLECTION);
const importQueueDbRef = collection(firestore, IMPORT_QUEUE_COLLECTION);
const feedItemsStorageRef = storageRef(storage, FEED_ITEMS_STORAGE_COLLECTION);

export const feedItemsService = new FeedItemsService(
  feedItemsDbRef,
  importQueueDbRef,
  feedItemsStorageRef
);
