import {ref as storageRef} from 'firebase/storage';

import {logger} from '@shared/services/logger.shared';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  IMPORT_QUEUE_DB_COLLECTION,
} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';
import {
  parseImportQueueItem,
  parseImportQueueItemId,
  toStorageImportQueueItem,
} from '@shared/parsers/importQueue.parser';

import {FEED_ITEM_EXTENSION_SOURCE} from '@shared/types/feedItems.types';

import {ClientFeedItemsService} from '@sharedClient/services/feedItems.client';
import {firebaseService} from '@sharedClient/services/firebase.client';
import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';
import {ClientImportQueueService} from '@sharedClient/services/importQueue.client';

// TODO: Refactor into a `FirebaseStorageCollectionService`.
const feedItemsStorageRef = storageRef(firebaseService.storage, FEED_ITEMS_STORAGE_COLLECTION);

chrome.action.onClicked.addListener(async (tab) => {
  // TODO: Get the account ID from the extension's auth once it's implemented.
  const accountIdResult = parseAccountId('TODO');
  if (!accountIdResult.success) {
    logger.error(prefixError(accountIdResult.error, 'Error getting account ID'));
    return;
  }
  const accountId = accountIdResult.value;

  const tabUrl = tab.url;
  if (!tabUrl) {
    logger.error(new Error('No URL found for tab'));
    return;
  }

  const feedItemFirestoreConverter = makeFirestoreDataConverter(toStorageFeedItem, parseFeedItem);

  const feedItemsCollectionService = new ClientFirestoreCollectionService({
    collectionPath: FEED_ITEMS_DB_COLLECTION,
    converter: feedItemFirestoreConverter,
    parseId: parseFeedItemId,
  });

  const importQueueItemFirestoreConverter = makeFirestoreDataConverter(
    toStorageImportQueueItem,
    parseImportQueueItem
  );

  const importQueueService = new ClientImportQueueService({
    importQueueCollectionService: new ClientFirestoreCollectionService({
      collectionPath: IMPORT_QUEUE_DB_COLLECTION,
      converter: importQueueItemFirestoreConverter,
      parseId: parseImportQueueItemId,
    }),
  });

  // TODO: Ideally I would not need to recreate a one-off FeedItemsService here, but I cannot use
  // `useFeedItemsService` because we are not in a React component.
  const feedItemsService = new ClientFeedItemsService({
    feedItemsCollectionService: feedItemsCollectionService,
    importQueueService: importQueueService,
    feedItemsStorageRef,
    accountId,
  });

  const addFeedItemResult = await feedItemsService.createFeedItem({
    url: tabUrl,
    feedItemSource: FEED_ITEM_EXTENSION_SOURCE,
  });

  if (!addFeedItemResult.success) {
    logger.error(prefixError(addFeedItemResult.error, 'Error saving URL'));
    return;
  }

  logger.log('URL saved successfully!', {});
});
