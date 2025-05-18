import {setGlobalOptions} from 'firebase-functions';
import {auth} from 'firebase-functions/v1';
import {onInit} from 'firebase-functions/v2/core';
import {onDocumentCreated, onDocumentUpdated} from 'firebase-functions/v2/firestore';
import {onCall, onRequest} from 'firebase-functions/v2/https';

import {logger} from '@shared/services/logger.shared';

import {
  FEED_ITEMS_DB_COLLECTION,
  USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseFeedItem, parseFeedItemId} from '@shared/parsers/feedItems.parser';

import type {ErrorResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import type {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';
import type {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';
import type {WipeoutService} from '@sharedServer/services/wipeout.server';

import {wipeoutAccountHelper} from '@src/lib/accountWipeout';
import {handleFeedUnsubscribeHelper} from '@src/lib/feedUnsubscribe';
import {initServices} from '@src/lib/initServices';
import {validateUrlParam, verifyAuth} from '@src/lib/middleware';
import {handleSuperfeedrWebhookHelper} from '@src/lib/superfeedrWebhook';

import {handleFeedItemImport} from '@src/reqHandlers/handleFeedItemImport';
import {handleSubscribeAccountToRssFeed} from '@src/reqHandlers/handleSubscribeAccountToRssFeed';

// TODO: Make region an environment variable.
const FIREBASE_FUNCTIONS_REGION = 'us-central1';

let userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
let wipeoutService: WipeoutService;
let rssFeedService: ServerRssFeedService;
let feedItemsService: ServerFeedItemsService;

// Initialize services on startup.
onInit(() => {
  const initResult = initServices();

  // Services failing to initialize is considered a fatal error, so log and throw.
  if (!initResult.success) {
    const fatalErr = prefixError(initResult.error, 'Fatal error while initializing services');
    logger.error(fatalErr);
    // eslint-disable-next-line no-restricted-syntax
    throw fatalErr;
  }

  const services = initResult.value;

  userFeedSubscriptionsService = services.userFeedSubscriptionsService;
  wipeoutService = services.wipeoutService;
  rssFeedService = services.rssFeedService;
  feedItemsService = services.feedItemsService;
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
export const subscribeAccountToRssFeedOnCall = onCall(
  // TODO: Lock down CORS to only allow requests from my domains.
  {cors: true},
  async (request): Promise<void> => {
    const accountId = verifyAuth(request);
    const parsedUrl = validateUrlParam(request);

    return await handleSubscribeAccountToRssFeed({
      accountId,
      parsedUrl,
      rssFeedService,
    });
  }
);

/**
 * Imports a feed item when it is first created, importing content and doing some LLM processing.
 */
export const importFeedItemOnCreate = onDocumentCreated(
  `${FEED_ITEMS_DB_COLLECTION}/{feedItemId}`,
  async (event) => {
    const rawFeedItemId = event.params.feedItemId;
    logger.log(`[IMPORT] New feed item document created...`, {rawFeedItemId});

    // Parse feed item ID from URL path.
    const idResult = parseFeedItemId(rawFeedItemId);
    if (!idResult.success) return logErrorAndReturn(idResult, {rawFeedItemId});
    const feedItemId = idResult.value;

    // Parse feed item data from Firestore.
    const itemResult = parseFeedItem(event.data?.data());
    if (!itemResult.success) return logErrorAndReturn(itemResult, {feedItemId});
    const feedItem = itemResult.value;
    const accountId = feedItem.accountId;

    logger.log(`[IMPORT] Importing feed item...`, {feedItemId, accountId});

    // Import feed item.
    const importResult = await handleFeedItemImport({feedItem, feedItemsService});
    if (!importResult.success) logErrorAndReturn(importResult, {feedItemId, accountId});

    logger.log(`[IMPORT] Successfully imported feed item`, {feedItemId, accountId});
  }
);

/**
 * Every time a feed item is updated, checks to see if it should be re-imported. The UI allows users
 * to manually re-import a feed item.
 */
export const importFeedItemOnUpdate = onDocumentUpdated(
  `${FEED_ITEMS_DB_COLLECTION}/{feedItemId}`,
  async (event) => {
    const rawFeedItemId = event.params.feedItemId;
    logger.log(`[IMPORT] Existing feed item document updated...`, {rawFeedItemId});

    // Parse feed item ID from URL path.
    const idResult = parseFeedItemId(rawFeedItemId);
    if (!idResult.success) return logErrorAndReturn(idResult, {rawFeedItemId});
    const feedItemId = idResult.value;

    // Parse feed item "before" data from Firestore.
    const afterItemResult = parseFeedItem(event.data?.after.data());
    if (!afterItemResult.success) return logErrorAndReturn(afterItemResult, {feedItemId});
    const afterFeedItem = afterItemResult.value;
    const accountId = afterFeedItem.accountId;

    // Parse feed item "after" data from Firestore.
    const beforeItemResult = parseFeedItem(event.data?.before.data());
    if (!beforeItemResult.success) return logErrorAndReturn(beforeItemResult, {feedItemId});
    const beforeFeedItem = beforeItemResult.value;

    // Only re-import if `shouldFetch` became true.
    const beforeShouldFetch = beforeFeedItem.importState.shouldFetch;
    const afterShouldFetch = afterFeedItem.importState.shouldFetch;
    const isReImport = !beforeShouldFetch && afterShouldFetch;
    if (!isReImport) return;

    // Re-import feed item.
    logger.log(`[IMPORT] Re-importing feed item...`, {feedItemId, accountId});
    const importResult = await handleFeedItemImport({feedItem: afterFeedItem, feedItemsService});
    if (!importResult.success) return logErrorAndReturn(importResult, {feedItemId, accountId});

    logger.log(`[IMPORT] Successfully re-imported feed item`, {feedItemId, accountId});
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

    logger.log('[UNSUBSCRIBE] Successfully unsubscribed account from feed', logDetails);
  }
);

const logErrorAndReturn = (errorResult: ErrorResult, logDetails: Record<string, unknown>): void => {
  logger.error(errorResult.error, logDetails);
  return;
};
