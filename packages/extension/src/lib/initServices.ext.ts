import {ref as storageRef} from 'firebase/storage';

import {
  EVENT_LOG_DB_COLLECTION,
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
} from '@shared/lib/constants.shared';

import {parseEventId, parseEventLogItem} from '@shared/parsers/eventLog.parser';
import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';

import type {AccountId} from '@shared/types/accounts.types';
import {Environment} from '@shared/types/environment.types';

import {toStorageEventLogItem} from '@shared/storage/eventLog.storage';

import {ClientEventLogService} from '@sharedClient/services/eventLog.client';
import {ClientFeedItemsService} from '@sharedClient/services/feedItems.client';
import {firebaseService} from '@sharedClient/services/firebase.client';
import {makeClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';

// TODO: Refactor into a `FirebaseStorageCollectionService`.
const feedItemsStorageRef = storageRef(firebaseService.storage, FEED_ITEMS_STORAGE_COLLECTION);

interface InitializedServices {
  readonly feedItemsService: ClientFeedItemsService;
}

export function initServices(args: {readonly accountId: AccountId}): InitializedServices {
  const {accountId} = args;

  // Event log service.
  const eventLogCollectionService = makeClientFirestoreCollectionService({
    collectionPath: EVENT_LOG_DB_COLLECTION,
    parseId: parseEventId,
    toStorage: toStorageEventLogItem,
    fromStorage: parseEventLogItem,
  });

  const eventLogService = new ClientEventLogService({
    environment: Environment.Extension,
    eventLogCollectionService,
    accountId,
  });

  // Feed items service.
  const feedItemsCollectionService = makeClientFirestoreCollectionService({
    collectionPath: FEED_ITEMS_DB_COLLECTION,
    parseId: parseFeedItemId,
    toStorage: toStorageFeedItem,
    fromStorage: parseFeedItem,
  });

  const feedItemsService = new ClientFeedItemsService({
    feedItemsCollectionService,
    feedItemsStorageRef,
    accountId,
    eventLogService,
  });

  return {feedItemsService};
}
