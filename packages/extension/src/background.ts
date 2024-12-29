import {collection} from 'firebase/firestore';
import {ref as storageRef} from 'firebase/storage';

import {logger} from '@shared/services/logger.shared';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  IMPORT_QUEUE_DB_COLLECTION,
} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseFeedItem, parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseImportQueueItem, parseImportQueueItemId} from '@shared/parsers/importQueue.parser';
import {parseUserId} from '@shared/parsers/user.parser';

import {FEED_ITEM_EXTENSION_SOURCE} from '@shared/types/feedItems.types';

import {ClientFeedItemsService} from '@sharedClient/services/feedItems.client';
import {firebaseService} from '@sharedClient/services/firebase.client';
import {ClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';
import {ClientImportQueueService} from '@sharedClient/services/importQueue.client';

const feedItemsDbRef = collection(firebaseService.firestore, FEED_ITEMS_DB_COLLECTION);
const importQueueDbRef = collection(firebaseService.firestore, IMPORT_QUEUE_DB_COLLECTION);
const feedItemsStorageRef = storageRef(firebaseService.storage, FEED_ITEMS_STORAGE_COLLECTION);

chrome.action.onClicked.addListener(async (tab) => {
  // TODO: Get the user ID from the extension's auth once it's implemented.
  const userIdResult = parseUserId('TODO');
  if (!userIdResult.success) {
    logger.error(prefixError(userIdResult.error, 'Error getting user ID'));
    return;
  }
  const userId = userIdResult.value;

  const tabUrl = tab.url;
  if (!tabUrl) {
    logger.error(new Error('No URL found for tab'));
    return;
  }

  const feedItemsCollectionService = new ClientFirestoreCollectionService({
    collectionRef: feedItemsDbRef,
    parseData: parseFeedItem,
    parseId: parseFeedItemId,
  });

  const importQueueService = new ClientImportQueueService({
    importQueueCollectionService: new ClientFirestoreCollectionService({
      collectionRef: importQueueDbRef,
      parseData: parseImportQueueItem,
      parseId: parseImportQueueItemId,
    }),
  });

  // TODO: Ideally I would not need to recreate a one-off FeedItemsService here, but I cannot use
  // `useFeedItemsService` because we are not in a React component.
  const feedItemsService = new ClientFeedItemsService({
    feedItemsCollectionService: feedItemsCollectionService,
    importQueueService: importQueueService,
    feedItemsStorageRef,
    userId,
  });

  const addFeedItemResult = await feedItemsService.createFeedItem({
    url: tabUrl,
    source: FEED_ITEM_EXTENSION_SOURCE,
  });

  if (!addFeedItemResult.success) {
    logger.error(prefixError(addFeedItemResult.error, 'Error saving URL'));
    return;
  }

  logger.log('URL saved successfully!', {userId});
});
