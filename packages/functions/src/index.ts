import {setGlobalOptions} from 'firebase-functions';
import {auth} from 'firebase-functions/v1';
import {onInit} from 'firebase-functions/v2/core';
import {onDocumentCreated, onDocumentUpdated} from 'firebase-functions/v2/firestore';
import {onCall, onRequest} from 'firebase-functions/v2/https';
import {onSchedule} from 'firebase-functions/v2/scheduler';

import {logger} from '@shared/services/logger.shared';

import {
  FEED_ITEMS_DB_COLLECTION,
  USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseFeedItem, parseFeedItemId} from '@shared/parsers/feedItems.parser';

import type {ErrorResult} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';

import type {ServerAccountsService} from '@sharedServer/services/accounts.server';
import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import type {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';
import type {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';
import type {WipeoutService} from '@sharedServer/services/wipeout.server';

import {FIREBASE_FUNCTIONS_REGION} from '@src/lib/env';
import {initServices} from '@src/lib/initServices';
import {validateUrlParam, verifyAuth} from '@src/lib/middleware';

import {handleCreateAccount} from '@src/reqHandlers/handleCreateAccount';
import {
  handleEmitIntervalFeeds,
  INTERVAL_FEED_EMISSION_INTERVAL_MINUTES,
} from '@src/reqHandlers/handleEmitIntervalFeeds';
import {handleFeedItemImport} from '@src/reqHandlers/handleFeedItemImport';
import {handleFeedUnsubscribe} from '@src/reqHandlers/handleFeedUnsubscribe';
import {handleSubscribeToRssFeed} from '@src/reqHandlers/handleSubscribeToRssFeed';
import {handleSuperfeedrWebhookHelper} from '@src/reqHandlers/handleSuperfeedrWebhook';
import {handleWipeoutAccount} from '@src/reqHandlers/handleWipeoutAccount';

let userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
let wipeoutService: WipeoutService;
let accountsService: ServerAccountsService;
let rssFeedService: ServerRssFeedService;
let feedItemsService: ServerFeedItemsService;
let rssFeedProvider: RssFeedProvider;

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
  accountsService = services.accountsService;
  wipeoutService = services.wipeoutService;
  rssFeedService = services.rssFeedService;
  feedItemsService = services.feedItemsService;
  rssFeedProvider = services.rssFeedProvider;
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
    const handleWebhookResult = await handleSuperfeedrWebhookHelper({
      request,
      userFeedSubscriptionsService,
      feedItemsService,
      rssFeedProvider,
    });

    if (!handleWebhookResult.success) {
      const betterError = prefixError(handleWebhookResult.error, '[SUPERFEEDR]');
      logger.error(betterError, {body: request.body});
      response.status(400).json({success: false, error: betterError.message});
      return;
    }

    response.status(200).json({success: true, value: undefined});
    return;
  }
);

/**
 * Initializes an account when a Firebase user is created.
 */
auth.user().onCreate(async (firebaseUser) => {
  const firebaseUid = firebaseUser.uid;
  const email = firebaseUser.email;
  const logDetails = {firebaseUid, email} as const;

  logger.log(`[CREATE ACCOUNT] Firebase user created. Processing account creation...`, logDetails);

  const createAccountResult = await handleCreateAccount({
    firebaseUid,
    email,
    accountsService,
  });

  if (!createAccountResult.success) {
    const betterError = prefixError(
      createAccountResult.error,
      '[CREATE ACCOUNT] Failed to create account'
    );
    logger.error(betterError, logDetails);
    return;
  }

  logger.log(`[CREATE ACCOUNT] Successfully created account`, logDetails);
});

/**
 * Permanently deletes all data associated with an account when their Firebase auth user is deleted.
 */
export const wipeoutAccountOnAuthDelete = auth.user().onDelete(async (firebaseUser) => {
  const firebaseUid = firebaseUser.uid;
  const logDetails = {firebaseUid} as const;

  logger.log(`[WIPEOUT] Firebase user deleted. Processing account wipeout...`, logDetails);

  const wipeoutResult = await handleWipeoutAccount({firebaseUid, wipeoutService});

  if (!wipeoutResult.success) {
    const betterError = prefixError(wipeoutResult.error, '[WIPEOUT] Failed to wipe out account');
    logger.error(betterError, logDetails);
    return;
  }

  logger.log(`[WIPEOUT] Successfully wiped out account`, logDetails);
});

/**
 * Subscribes to a URL via the RSS feed service.
 */
export const subscribeToRssFeedOnCall = onCall(
  // TODO: Lock down CORS to only allow requests from my domains.
  {cors: true},
  async (request): Promise<void> => {
    verifyAuth(request);
    const parsedUrl = validateUrlParam(request);
    return await handleSubscribeToRssFeed({parsedUrl, rssFeedService});
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

    const result = await handleFeedUnsubscribe({
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

// Recurring scheduled task which emits interval feed items.
export const emitIntervalFeeds = onSchedule(
  `*/${INTERVAL_FEED_EMISSION_INTERVAL_MINUTES} * * * *`,
  async () => {
    logger.log('[INTERVAL FEEDS] Checking for interval feed emissions...');

    const result = await handleEmitIntervalFeeds({feedItemsService, userFeedSubscriptionsService});

    if (!result.success) {
      logger.error(prefixError(result.error, `[INTERVAL FEEDS] Error emitting interval feeds`));
      return;
    }

    const {totalCount, successCount, failureCount} = result.value;

    logger.log('[INTERVAL FEEDS] Successfully emitted interval feeds', {
      totalCount,
      successCount,
      failureCount,
    });
  }
);
