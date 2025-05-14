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
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseAccount, parseAccountId, toStorageAccount} from '@shared/parsers/accounts.parser';
import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';
import {
  parseFeedSource,
  parseFeedSourceId,
  toStorageFeedSource,
} from '@shared/parsers/feedSources.parser';
import {parseRssFeedProviderType} from '@shared/parsers/rss.parser';
import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
  toStorageUserFeedSubscription,
} from '@shared/parsers/userFeedSubscriptions.parser';

import {FeedItemImportStatus} from '@shared/types/feedItems.types';
import type {Result} from '@shared/types/results.types';
import {RssFeedProviderType, type RssFeedProvider} from '@shared/types/rss.types';

import {ServerAccountsService} from '@sharedServer/services/accounts.server';
import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFeedSourcesService} from '@sharedServer/services/feedSources.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import {
  makeFirestoreDataConverter,
  ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';
import {LocalRssFeedProvider} from '@sharedServer/services/localRssFeedProvider';
import {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';
import {SuperfeedrService} from '@sharedServer/services/superfeedr.server';
import {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';
import {WipeoutService} from '@sharedServer/services/wipeout.server';

import {wipeoutAccountHelper} from '@src/lib/accountWipeout';
import {feedItemImportHelper} from '@src/lib/feedItemImport';
import {handleFeedUnsubscribeHelper} from '@src/lib/feedUnsubscribe';
import {validateUrlParam, verifyAuth} from '@src/lib/middleware';
import {handleSuperfeedrWebhookHelper} from '@src/lib/superfeedrWebhook';

import {handleSubscribeAccountToFeedOnCallRequest} from '@src/reqHandlers/handleSubscribeAccountToFeedOnCall';
import type {SubscribeAccountToFeedOnCallResponse} from '@src/reqHandlers/handleSubscribeAccountToFeedOnCall';

const FIRECRAWL_API_KEY = defineString('FIRECRAWL_API_KEY');
const LOCAL_RSS_FEED_PROVIDER_PORT = defineString('LOCAL_RSS_FEED_PROVIDER_PORT');
const RSS_FEED_PROVIDER_TYPE = defineString('RSS_FEED_PROVIDER_TYPE');
const SUPERFEEDR_USER = defineString('SUPERFEEDR_USER');
const SUPERFEEDR_API_KEY = defineString('SUPERFEEDR_API_KEY');

// TODO: Make region an environment variable.
const FIREBASE_FUNCTIONS_REGION = 'us-central1';
const FUNCTIONS_BASE_URL = `https://${FIREBASE_FUNCTIONS_REGION}-${projectID.value()}.cloudfunctions.net`;

let feedSourcesService: ServerFeedSourcesService;
let userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
let wipeoutService: WipeoutService;
let rssFeedService: ServerRssFeedService;
let feedItemsService: ServerFeedItemsService;

function getRssFeedProvider(): Result<RssFeedProvider> {
  const parsedFeedProviderTypeResult = parseRssFeedProviderType(RSS_FEED_PROVIDER_TYPE.value());
  if (!parsedFeedProviderTypeResult.success) return parsedFeedProviderTypeResult;

  const feedProviderType = parsedFeedProviderTypeResult.value;

  const callbackUrl = `${FUNCTIONS_BASE_URL}/handleSuperfeedrWebhook`;

  let rssFeedProvider: RssFeedProvider;
  switch (feedProviderType) {
    case RssFeedProviderType.Local:
      rssFeedProvider = new LocalRssFeedProvider({
        port: parseInt(LOCAL_RSS_FEED_PROVIDER_PORT.value(), 10),
        callbackUrl,
      });
      break;
    case RssFeedProviderType.Superfeedr:
      rssFeedProvider = new SuperfeedrService({
        superfeedrUser: SUPERFEEDR_USER.value(),
        superfeedrApiKey: SUPERFEEDR_API_KEY.value(),
        callbackUrl,
      });
      break;
    default: {
      assertNever(feedProviderType);
    }
  }

  return makeSuccessResult(rssFeedProvider);
}

// Initialize services on startup.
onInit(() => {
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

  const rssFeedProviderResult = getRssFeedProvider();
  if (!rssFeedProviderResult.success) {
    const betterError = prefixError(
      rssFeedProviderResult.error,
      'Failed to create RSS feed provider. Make sure RSS_FEED_PROVIDER_TYPE is set.'
    );
    logger.error(betterError, {rssFeedProviderResult});
    // This is considered a fatal error, so allow this to throw.
    // eslint-disable-next-line no-restricted-syntax
    throw betterError;
  }

  rssFeedService = new ServerRssFeedService({
    rssFeedProvider: rssFeedProviderResult.value,
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
  async (request): Promise<SubscribeAccountToFeedOnCallResponse> => {
    const accountId = verifyAuth(request);
    const parsedUrl = validateUrlParam(request);

    return await handleSubscribeAccountToFeedOnCallRequest({
      accountId,
      parsedUrl,
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
