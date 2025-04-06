import FirecrawlApp from '@mendable/firecrawl-js';
import {setGlobalOptions} from 'firebase-functions';
import {defineString, projectID} from 'firebase-functions/params';
import {auth} from 'firebase-functions/v1';
import {onInit} from 'firebase-functions/v2/core';
import {onDocumentCreated, onDocumentUpdated} from 'firebase-functions/v2/firestore';
import {onCall, onRequest} from 'firebase-functions/v2/https';

import {
  ACCOUNTS_DB_COLLECTION,
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  FEED_SOURCES_DB_COLLECTION,
  IMPORT_QUEUE_DB_COLLECTION,
  USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
} from '@shared/lib/constants.shared';

import {parseAccount, parseAccountId, toStorageAccount} from '@shared/parsers/accounts.parser';
import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';
import {
  parseFeedSource,
  parseFeedSourceId,
  toStorageFeedSource,
} from '@shared/parsers/feedSources.parser';
import {
  parseImportQueueItem,
  parseImportQueueItemId,
  toStorageImportQueueItem,
} from '@shared/parsers/importQueue.parser';
import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
  toStorageUserFeedSubscription,
} from '@shared/parsers/userFeedSubscriptions.parser';

import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

import {ServerAccountsService} from '@sharedServer/services/accounts.server';
import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFeedSourcesService} from '@sharedServer/services/feedSources.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import {
  makeFirestoreDataConverter,
  ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';
import {ServerImportQueueService} from '@sharedServer/services/importQueue.server';
import {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';
import {SuperfeedrService} from '@sharedServer/services/superfeedr.server';
import {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';
import {WipeoutService} from '@sharedServer/services/wipeout.server';

import {wipeoutAccountHelper} from '@src/lib/accountWipeout';
import {subscribeAccountToFeedHelper} from '@src/lib/feedSubscription';
import {handleFeedUnsubscribeHelper} from '@src/lib/feedUnsubscribe';
import {createImportQueueItemHelper} from '@src/lib/importQueueCreation';
import {processImportQueueItem} from '@src/lib/importQueueProcessor';
import {handleSuperfeedrWebhookHelper} from '@src/lib/superfeedrWebhook';

const FIRECRAWL_API_KEY = defineString('FIRECRAWL_API_KEY');
const SUPERFEEDR_USER = defineString('SUPERFEEDR_USER');
const SUPERFEEDR_API_KEY = defineString('SUPERFEEDR_API_KEY');

// TODO: This should be an environment variable.
const FIREBASE_FUNCTIONS_REGION = 'us-central1';

let feedSourcesService: ServerFeedSourcesService;
let userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
let importQueueService: ServerImportQueueService;
let wipeoutService: WipeoutService;
let rssFeedService: ServerRssFeedService;
let feedItemsService: ServerFeedItemsService;

// Initialize services on startup
onInit(() => {
  const firecrawlApp = new FirecrawlApp({apiKey: FIRECRAWL_API_KEY.value()});

  const superfeedrService = new SuperfeedrService({
    superfeedrUser: SUPERFEEDR_USER.value(),
    superfeedrApiKey: SUPERFEEDR_API_KEY.value(),
    webhookBaseUrl: `https://${FIREBASE_FUNCTIONS_REGION}-${projectID.value()}.cloudfunctions.net`,
  });

  const feedSourceFirestoreConverter = makeFirestoreDataConverter(
    toStorageFeedSource,
    parseFeedSource
  );

  const feedSourcesCollectionService = new ServerFirestoreCollectionService({
    collectionPath: FEED_SOURCES_DB_COLLECTION,
    converter: feedSourceFirestoreConverter,
    parseId: parseFeedSourceId,
  });

  feedSourcesService = new ServerFeedSourcesService({feedSourcesCollectionService});

  const userFeedSubscriptionFirestoreConverter = makeFirestoreDataConverter(
    toStorageUserFeedSubscription,
    parseUserFeedSubscription
  );

  const userFeedSubscriptionsCollectionService = new ServerFirestoreCollectionService({
    collectionPath: USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
    converter: userFeedSubscriptionFirestoreConverter,
    parseId: parseUserFeedSubscriptionId,
  });

  userFeedSubscriptionsService = new ServerUserFeedSubscriptionsService({
    userFeedSubscriptionsCollectionService,
  });

  const feedItemFirestoreConverter = makeFirestoreDataConverter(toStorageFeedItem, parseFeedItem);

  const feedItemsCollectionService = new ServerFirestoreCollectionService({
    collectionPath: FEED_ITEMS_DB_COLLECTION,
    converter: feedItemFirestoreConverter,
    parseId: parseFeedItemId,
  });

  feedItemsService = new ServerFeedItemsService({
    feedItemsCollectionService,
    storageCollectionPath: FEED_ITEMS_STORAGE_COLLECTION,
  });

  const importQueueItemFirestoreConverter = makeFirestoreDataConverter(
    toStorageImportQueueItem,
    parseImportQueueItem
  );

  const importQueueCollectionService = new ServerFirestoreCollectionService({
    collectionPath: IMPORT_QUEUE_DB_COLLECTION,
    converter: importQueueItemFirestoreConverter,
    parseId: parseImportQueueItemId,
  });

  importQueueService = new ServerImportQueueService({
    importQueueCollectionService,
    firecrawlService: new ServerFirecrawlService(firecrawlApp),
    feedItemsService,
  });

  const accountFirestoreConverter = makeFirestoreDataConverter(toStorageAccount, parseAccount);

  const accountsCollectionService = new ServerFirestoreCollectionService({
    collectionPath: ACCOUNTS_DB_COLLECTION,
    converter: accountFirestoreConverter,
    parseId: parseAccountId,
  });

  wipeoutService = new WipeoutService({
    accountsService: new ServerAccountsService({accountsCollectionService}),
    userFeedSubscriptionsService,
    importQueueService,
    feedItemsService,
  });

  rssFeedService = new ServerRssFeedService({
    superfeedrService,
    feedSourcesService,
    userFeedSubscriptionsService,
  });
});

setGlobalOptions({
  region: FIREBASE_FUNCTIONS_REGION,
  invoker: 'private', // Only allow authenticated requests.
});

/**
 * Handles webhook callbacks from Superfeedr when feed content is updated.
 */
export const handleSuperfeedrWebhook = onRequest(
  // This webhook is server-to-server, so we don't need to worry about CORS.
  {cors: false},
  async (request, response) => {
    await handleSuperfeedrWebhookHelper({
      request,
      response,
      feedSourcesService,
      userFeedSubscriptionsService,
      feedItemsService,
    });
  }
);

/**
 * Processes an import queue item when it is created.
 */
export const processImportQueueOnDocumentCreated = onDocumentCreated(
  `/${IMPORT_QUEUE_DB_COLLECTION}/{importQueueItemId}`,
  async (event) => {
    await processImportQueueItem({
      importQueueItemId: event.params.importQueueItemId,
      data: event.data,
      importQueueService,
    });
  }
);

/**
 * Permanently deletes all data associated with an account when their Firebase auth user is deleted.
 */
export const wipeoutAccountOnAuthDelete = auth.user().onDelete(async (firebaseUser) => {
  await wipeoutAccountHelper({
    firebaseUid: firebaseUser.uid,
    wipeoutService,
  });
});

/**
 * Subscribes an account to a feed source, creating it if necessary.
 */
export const subscribeAccountToFeedOnCall = onCall(
  // TODO: Lock down CORS to only allow requests from my domains.
  {cors: true},
  async (request): Promise<{readonly userFeedSubscriptionId: UserFeedSubscriptionId}> => {
    return subscribeAccountToFeedHelper({
      auth: request.auth,
      data: request.data,
      rssFeedService,
    });
  }
);

/**
 * Creates an import queue item when a feed item is created.
 *
 * This is decoupled from feed item creation to simplify logic for callers. They just need to create
 * a new feed item and this function will handle the rest.
 */
export const createImportQueueItemOnFeedItemCreated = onDocumentCreated(
  `${FEED_ITEMS_DB_COLLECTION}/{feedItemId}`,
  async (event) => {
    await createImportQueueItemHelper({
      feedItemId: event.params.feedItemId,
      data: event.data?.data(),
      importQueueService,
    });
  }
);

/**
 * Handles unsubscribe events when a user feed subscription is marked as inactive.
 */
export const handleFeedUnsubscribeOnUpdate = onDocumentUpdated(
  `${USER_FEED_SUBSCRIPTIONS_DB_COLLECTION}/{userFeedSubscriptionId}`,
  async (event) => {
    await handleFeedUnsubscribeHelper({
      userFeedSubscriptionId: event.params.userFeedSubscriptionId,
      beforeData: event.data?.before.data(),
      afterData: event.data?.after.data(),
      rssFeedService,
    });
  }
);
