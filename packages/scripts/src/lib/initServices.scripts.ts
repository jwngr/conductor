import FirecrawlApp from '@mendable/firecrawl-js';

import {
  EVENT_LOG_DB_COLLECTION,
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
} from '@shared/lib/constants.shared';

import {
  parseEventId,
  parseEventLogItem,
  toStorageEventLogItem,
} from '@shared/parsers/eventLog.parser';
import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';

import {Environment} from '@shared/types/environment.types';

import {ServerEventLogService} from '@sharedServer/services/eventLog.server';
import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import {makeServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

interface InitializedServices {
  readonly feedItemsService: ServerFeedItemsService;
}

export const initServices = (args: {readonly firecrawlApiKey: string}): InitializedServices => {
  const {firecrawlApiKey} = args;

  // Event log service.
  const eventLogCollectionService = makeServerFirestoreCollectionService({
    collectionPath: EVENT_LOG_DB_COLLECTION,
    toStorage: toStorageEventLogItem,
    fromStorage: parseEventLogItem,
    parseId: parseEventId,
  });

  const eventLogService = new ServerEventLogService({
    environment: Environment.Scripts,
    collectionService: eventLogCollectionService,
  });

  // Firecrawl service.
  const firecrawlApp = new FirecrawlApp({apiKey: firecrawlApiKey});
  const firecrawlService = new ServerFirecrawlService(firecrawlApp);

  // Feed items service .
  const feedItemsCollectionService = makeServerFirestoreCollectionService({
    collectionPath: FEED_ITEMS_DB_COLLECTION,
    toStorage: toStorageFeedItem,
    fromStorage: parseFeedItem,
    parseId: parseFeedItemId,
  });

  const feedItemsService = new ServerFeedItemsService({
    collectionService: feedItemsCollectionService,
    storageCollectionPath: FEED_ITEMS_STORAGE_COLLECTION,
    firecrawlService,
    eventLogService,
  });

  return {
    feedItemsService,
  };
};
