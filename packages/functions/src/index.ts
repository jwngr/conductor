import FirecrawlApp from '@mendable/firecrawl-js';
import {logger, setGlobalOptions} from 'firebase-functions';
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
  USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseAccount, parseAccountId, toStorageAccount} from '@shared/parsers/accounts.parser';
import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';
import {
  parseFeedSource,
  parseFeedSourceId,
  toStorageFeedSource,
} from '@shared/parsers/feedSources.parser';
import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
  toStorageUserFeedSubscription,
} from '@shared/parsers/userFeedSubscriptions.parser';

import {FeedItemImportStatus} from '@shared/types/feedItems.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

import {ServerAccountsService} from '@sharedServer/services/accounts.server';
import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFeedSourcesService} from '@sharedServer/services/feedSources.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import {
  makeFirestoreDataConverter,
  ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';
import {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';
import {SuperfeedrService} from '@sharedServer/services/superfeedr.server';
import {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';
import {WipeoutService} from '@sharedServer/services/wipeout.server';

import {wipeoutAccountHelper} from '@src/lib/accountWipeout';
import {feedItemImportHelper} from '@src/lib/feedItemImport';
import {subscribeAccountToFeedHelper} from '@src/lib/feedSubscription';
import {handleFeedUnsubscribeHelper} from '@src/lib/feedUnsubscribe';
import {handleSuperfeedrWebhookHelper} from '@src/lib/superfeedrWebhook';

const FIRECRAWL_API_KEY = defineString('FIRECRAWL_API_KEY');
const SUPERFEEDR_USER = defineString('SUPERFEEDR_USER');
const SUPERFEEDR_API_KEY = defineString('SUPERFEEDR_API_KEY');

// TODO: This should be an environment variable.
const FIREBASE_FUNCTIONS_REGION = 'us-central1';

let feedSourcesService: ServerFeedSourcesService;
let userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
let wipeoutService: WipeoutService;
let rssFeedService: ServerRssFeedService;
let feedItemsService: ServerFeedItemsService;

// Initialize services on startup
onInit(() => {
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

  const firecrawlApp = new FirecrawlApp({apiKey: FIRECRAWL_API_KEY.value()});
  const firecrawlService = new ServerFirecrawlService(firecrawlApp);

  feedItemsService = new ServerFeedItemsService({
    feedItemsCollectionService,
    storageCollectionPath: FEED_ITEMS_STORAGE_COLLECTION,
    firecrawlService,
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
 * Permanently deletes all data associated with an account when their Firebase auth user is deleted.
 */
export const wipeoutAccountOnAuthDelete = auth.user().onDelete(async (firebaseUser) => {
  const firebaseUid = firebaseUser.uid;
  const logDetails = {firebaseUid} as const;

  logger.log(`[WIPEOUT] Firebase user deleted. Processing account wipeout...`, logDetails);

  const wipeoutResult = await wipeoutAccountHelper({firebaseUid, wipeoutService});

  if (!wipeoutResult.success) {
    const betterError = prefixError(wipeoutResult.error, '[WIPEOUT] Failed to wipe out account');
    logger.error(betterError, logDetails);
    return;
  }

  logger.log(`[WIPEOUT] Successfully wiped out account`, logDetails);
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
 * Imports a feed item, importing content and doing some LLM processing.
 */
export const importFeedItemOnCreate = onDocumentCreated(
  `${FEED_ITEMS_DB_COLLECTION}/{feedItemId}`,
  async (event) => {
    const feedItemIdResult = parseFeedItemId(event.params.feedItemId);
    if (!feedItemIdResult.success) {
      logger.error(feedItemIdResult.error, {feedItemId: event.params.feedItemId});
      return;
    }

    const feedItemId = feedItemIdResult.value;
    const feedItemResult = parseFeedItem(event.data?.data());
    if (!feedItemResult.success) {
      logger.error(feedItemResult.error, {feedItemId});
      return;
    }

    const feedItem = feedItemResult.value;
    const logDetails = {feedItemId, accountId: feedItem.accountId} as const;

    if (!event.data) {
      logger.error(new Error('No event data found'), logDetails);
      return;
    }

    if (
      feedItem.importState.status !== FeedItemImportStatus.New ||
      !feedItem.importState.shouldFetch
    ) {
      logger.warn(`[IMPORT] Feed item has unexpected import state. Skipping...`, logDetails);
      return;
    }

    const importResult = await feedItemImportHelper({feedItem, feedItemsService});
    if (!importResult.success) {
      logger.error(importResult.error, logDetails);
      return;
    }

    logger.log(`[IMPORT] Successfully processed import queue item`, logDetails);
  }
);

/**
 * Imports a feed item, importing content and doing some LLM processing.
 */
export const importFeedItemOnUpdate = onDocumentUpdated(
  `${FEED_ITEMS_DB_COLLECTION}/{feedItemId}`,
  async (event) => {
    const feedItemIdResult = parseFeedItemId(event.params.feedItemId);
    if (!feedItemIdResult.success) {
      logger.error(feedItemIdResult.error, {feedItemId: event.params.feedItemId});
      return;
    }

    const feedItemId = feedItemIdResult.value;
    const feedItemData = event.data?.after.data();
    if (!feedItemData) {
      logger.error(new Error('No feed item data found'), {feedItemId});
      return;
    }

    const feedItemResult = parseFeedItem(feedItemData);
    if (!feedItemResult.success) {
      logger.error(feedItemResult.error, {feedItemId, feedItemData});
      return;
    }

    const feedItem = feedItemResult.value;
    const logDetails = {feedItemId, accountId: feedItem.accountId} as const;

    if (!event.data) {
      logger.error(new Error('No event data found'), logDetails);
      return;
    }

    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    // Only re-import if `shouldFetch` became true.
    const isReImport = !beforeData.importState.shouldFetch && afterData.importState.shouldFetch;
    if (!isReImport) return;

    const importResult = await feedItemImportHelper({feedItem, feedItemsService});

    if (!importResult.success) {
      logger.error(importResult.error, logDetails);
      return;
    }

    logger.log(`[IMPORT] Successfully processed import queue item`, logDetails);
  }
);

/**
 * Handles unsubscribe events when a user feed subscription is marked as inactive.
 */
export const handleFeedUnsubscribeOnUpdate = onDocumentUpdated(
  `${USER_FEED_SUBSCRIPTIONS_DB_COLLECTION}/{userFeedSubscriptionId}`,
  async (event) => {
    const userFeedSubscriptionId = event.params.userFeedSubscriptionId;

    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    const logDetails = {userFeedSubscriptionId, beforeData, afterData} as const;

    const result = await handleFeedUnsubscribeHelper({
      beforeData,
      afterData,
      rssFeedService,
    });

    if (!result.success) {
      const betterError = prefixError(result.error, '[UNSUBSCRIBE] Error unsubscribing account');
      logger.error(betterError, logDetails);
      return;
    }

    logger.log('[UNSUBSCRIBE] Successfully unsubscribed account from Superfeedr feed', logDetails);
  }
);
