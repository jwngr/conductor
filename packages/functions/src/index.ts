import FirecrawlApp from '@mendable/firecrawl-js';
import {setGlobalOptions} from 'firebase-functions';
import {defineString} from 'firebase-functions/params';
import {auth} from 'firebase-functions/v1';
import {onInit} from 'firebase-functions/v2/core';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import {HttpsError, onCall, onRequest} from 'firebase-functions/v2/https';

import {logger} from '@shared/services/logger.shared';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  FEED_SOURCES_DB_COLLECTION,
  IMPORT_QUEUE_DB_COLLECTION,
  USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
  USERS_DB_COLLECTION,
} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';

import {
  ImportQueueItem,
  ImportQueueItemStatus,
  makeImportQueueItemId,
} from '@shared/types/importQueue.types';
import {makeUserId, UserId} from '@shared/types/user.types';
import {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFeedSourcesService} from '@sharedServer/services/feedSources.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import {ServerImportQueueService} from '@sharedServer/services/importQueue.server';
import {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';
import {SuperfeedrService} from '@sharedServer/services/superfeedr.server';
import {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';
import {ServerUsersService} from '@sharedServer/services/users.server';
import {WipeoutService} from '@sharedServer/services/wipeout.server';

import {FIREBASE_PROJECT_ID, firestore} from '@sharedServer/lib/firebase.server';

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
onInit(() => {
  const firecrawlApp = new FirecrawlApp({apiKey: FIRECRAWL_API_KEY.value()});

  const superfeedrService = new SuperfeedrService({
    superfeedrUser: SUPERFEEDR_USER.value(),
    superfeedrApiKey: SUPERFEEDR_API_KEY.value(),
    webhookBaseUrl: `https://${FIREBASE_FUNCTIONS_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net`,
  });

  feedSourcesService = new ServerFeedSourcesService({
    feedSourcesDbRef: firestore.collection(FEED_SOURCES_DB_COLLECTION),
  });

  userFeedSubscriptionsService = new ServerUserFeedSubscriptionsService({
    userFeedSubscriptionsDbRef: firestore.collection(USER_FEED_SUBSCRIPTIONS_DB_COLLECTION),
  });

  const feedItemsService = new ServerFeedItemsService({
    feedItemsDbRef: firestore.collection(FEED_ITEMS_DB_COLLECTION),
    storageCollectionPath: FEED_ITEMS_STORAGE_COLLECTION,
  });

  importQueueService = new ServerImportQueueService({
    importQueueDbRef: firestore.collection(IMPORT_QUEUE_DB_COLLECTION),
    firecrawlService: new ServerFirecrawlService(firecrawlApp),
    feedItemsService,
  });

  wipeoutService = new WipeoutService({
    usersService: new ServerUsersService({usersDbRef: firestore.collection(USERS_DB_COLLECTION)}),
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
  region: 'us-central1', // TODO: This should probably be an environment variable.
  invoker: 'private', // Only allow authenticated requests to the functions.
});

/**
 * Processes an import queue item when it is created.
 */
export const processImportQueueOnDocumentCreated = onDocumentCreated(
  `/${IMPORT_QUEUE_DB_COLLECTION}/{importQueueItemId}`,
  async (event) => {
    const {importQueueItemId: maybeImportQueueItemId} = event.params;

    logger.log(`[IMPORT] Processing import queue item "${maybeImportQueueItemId}"`);

    const importQueueItemIdResult = makeImportQueueItemId(maybeImportQueueItemId);
    if (!importQueueItemIdResult.success) {
      logger.error(prefixError(importQueueItemIdResult.error, 'Error making import queue itemId'), {
        maybeImportQueueItemId,
      });
      return;
    }
    const importQueueItemId = importQueueItemIdResult.value;

    const snapshot = event.data;
    if (!snapshot) {
      logger.error(new Error(`[IMPORT] No data associated with import queue item`), {
        importQueueItemId,
      });
      return;
    }

    // TODO: Properly validate the import item schema.
    const importQueueItem = {importQueueItemId, ...snapshot.data()} as ImportQueueItem;

    // Avoid double processing by only processing items with a "new" status.
    if (importQueueItem.status !== ImportQueueItemStatus.New) {
      logger.warn(
        `[IMPORT] Import queue item ${importQueueItemId} is not in the "new" status. Skipping...`
      );
      return;
    }

    const logDetails = {
      importQueueItemId,
      feedItemId: importQueueItem.feedItemId,
      userId: importQueueItem.userId,
    } as const;

    const handleError = async (errorPrefix: string, error: Error) => {
      logger.error(prefixError(error, errorPrefix), logDetails);
      await importQueueService.updateImportQueueItem(importQueueItemId, {
        status: ImportQueueItemStatus.Failed,
      });
    };

    // Claim the item so that no other function picks it up.
    logger.log(`[IMPORT] Claiming import queue item...`, logDetails);
    const claimItemResult = await importQueueService.updateImportQueueItem(importQueueItemId, {
      status: ImportQueueItemStatus.Processing,
    });
    if (!claimItemResult.success) {
      await handleError('Failed to claim import queue item', claimItemResult.error);
      return;
    }

    // Actually import the feed item.
    logger.log(`[IMPORT] Importing queue item...`, logDetails);
    const importItemResult = await importQueueService.importFeedItem(importQueueItem);
    if (!importItemResult.success) {
      await handleError('Error importing queue item', importItemResult.error);
      return;
    }

    // Remove the import queue item once everything else has processed successfully.
    logger.log(`[IMPORT] Deleting import queue item...`, logDetails);
    const deleteItemResult = await importQueueService.deleteImportQueueItem(importQueueItemId);
    if (!deleteItemResult.success) {
      await handleError('Error deleting import queue item', deleteItemResult.error);
      return;
    }

    logger.log(`[IMPORT] Successfully processed import queue item`, logDetails);
  }
);

/**
 * Permanently deletes all data associated with a user when their Firebase auth account is deleted.
 */
export const wipeoutUserOnAuthDelete = auth.user().onDelete(async (firebaseUser) => {
  const userIdResult = makeUserId(firebaseUser.uid);
  if (!userIdResult.success) {
    logger.error(
      prefixError(userIdResult.error, '[WIPEOUT] Invalid user ID. Not wiping out user.'),
      {userId: firebaseUser.uid}
    );
    return;
  }
  const userId = userIdResult.value;

  logger.log(`[WIPEOUT] Wiping out user...`, {userId});
  const wipeoutUserResult = await wipeoutService.wipeoutUser(userId);
  if (!wipeoutUserResult.success) {
    logger.error(prefixError(wipeoutUserResult.error, '[WIPEOUT] Failed to wipe out user'), {
      userId,
    });
    return;
  }

  logger.log(`[WIPEOUT] Successfully wiped out user`, {userId});
});

/**
 * Subscribes a user to a feed source, creating it if necessary.
 */
export const subscribeUserToFeedOnCall = onCall(
  // TODO: Lock down CORS to only allow requests from my domains.
  {cors: true},
  async (request): Promise<{readonly userFeedSubscriptionId: UserFeedSubscriptionId}> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    } else if (!request.data.url) {
      // TODO: Use zod to validate the request data.
      throw new HttpsError('invalid-argument', 'URL is required');
    }

    const userId = request.auth.uid as UserId;
    const {url} = request.data;

    const logDetails = {url, userId} as const;

    logger.log(`[SUBSCRIBE] Subscribing user to feed source via URL...`, logDetails);

    const subscribeUserResult = await rssFeedService.subscribeUserToUrl({url, userId});
    if (!subscribeUserResult.success) {
      logger.error(
        prefixError(
          subscribeUserResult.error,
          '[SUBSCRIBE] Error subscribing user to feed source via URL'
        ),
        logDetails
      );
      throw new HttpsError('internal', subscribeUserResult.error.message);
    }

    const userFeedSubscription = subscribeUserResult.value;

    logger.log(`[SUBSCRIBE] Successfully subscribed user to feed source`, {
      ...logDetails,
      feedSourceId: userFeedSubscription.feedSourceId,
      userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    });

    return {
      userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    };
  }
);

/**
 * Handles webhook callbacks from Superfeedr when feed content is updated.
 */
export const handleSuperfeedrWebhook = onRequest(
  // {
  //   cors: false, // Only allow Superfeedr to call this endpoint
  // },
  async (request, response) => {
    // if (request.method !== 'POST') {
    //   response.sendStatus(405); // Method Not Allowed
    //   return;
    // }

    // Validate the request is from Superfeedr by checking the auth header
    // const authHeader = request.headers.authorization;
    // if (!authHeader?.startsWith('Basic ')) {
    //   logger.error(new Error('[SUPERFEEDR] Missing or invalid authorization header'));
    //   response.sendStatus(401);
    //   return;
    // }

    // const providedAuth = Buffer.from(authHeader.slice(6), 'base64').toString();
    // const expectedAuth = `${SUPERFEEDR_USER.value()}:${SUPERFEEDR_API_KEY.value()}`;
    // if (providedAuth !== expectedAuth) {
    //   logger.error(new Error('[SUPERFEEDR] Invalid credentials'));
    //   response.sendStatus(401);
    //   return;
    // }

    logger.log('[SUPERFEEDR] Received webhook callback', {
      body: request.body,
      bodyJson: JSON.stringify(request.body),
    });

    // TODO: Process feed items and store them
    // This would likely involve:
    // 1. Getting the feed source from the database
    // 2. Finding all subscribed users
    // 3. Creating feed items
    // 4. Notifying users of new items

    // Superfeedr expects a 2XX response to confirm receipt
    response.sendStatus(200);
  }
);
