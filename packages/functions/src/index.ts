import FirecrawlApp from '@mendable/firecrawl-js';
import {setGlobalOptions} from 'firebase-functions';
import {defineString, projectID} from 'firebase-functions/params';
import {auth} from 'firebase-functions/v1';
import {onInit} from 'firebase-functions/v2/core';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import {HttpsError, onCall} from 'firebase-functions/v2/https';

import {logger} from '@shared/services/logger.shared';

import {
  ACCOUNTS_DB_COLLECTION,
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  FEED_SOURCES_DB_COLLECTION,
  IMPORT_QUEUE_DB_COLLECTION,
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
  parseImportQueueItem,
  parseImportQueueItemId,
  toStorageImportQueueItem,
} from '@shared/parsers/importQueue.parser';
import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
  toStorageUserFeedSubscription,
} from '@shared/parsers/userFeedSubscriptions.parser';

import {ImportQueueItem, ImportQueueItemStatus} from '@shared/types/importQueue.types';
import {makeSuccessResult} from '@shared/types/result.types';

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

const FIRECRAWL_API_KEY = defineString('FIRECRAWL_API_KEY');
const SUPERFEEDR_USER = defineString('SUPERFEEDR_USER');
const SUPERFEEDR_API_KEY = defineString('SUPERFEEDR_API_KEY');

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
    webhookBaseUrl: `https://${projectID.value()}.firebaseapp.com`,
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

  const feedItemsService = new ServerFeedItemsService({
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

    const parseIdResult = parseImportQueueItemId(maybeImportQueueItemId);
    if (!parseIdResult.success) {
      logger.error(
        prefixError(parseIdResult.error, '[IMPORT] Invalid import queue item ID. Skipping...'),
        {maybeImportQueueItemId}
      );
      return;
    }
    const importQueueItemId = parseIdResult.value;

    const snapshot = event.data;
    if (!snapshot) {
      logger.error(new Error(`[IMPORT] No data associated with import queue item`), {
        importQueueItemId,
      });
      return;
    }

    // const importQueueItemResult = parseImportQueueItem(snapshot.data());
    // if (!importQueueItemResult.success) {
    //   logger.error(
    //     prefixError(importQueueItemResult.error, '[IMPORT] Invalid import queue item data'),
    //     {importQueueItemId}
    //   );
    //   return;
    // }
    // const importQueueItem = importQueueItemResult.value;
    // TODO: This cast is a lie and it is really a `ImportQueueItemFromSchema` since functions don't
    // seem to auto-convert the data from the snapshot correctly.
    const importQueueItem = snapshot.data() as ImportQueueItem;

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
      accountId: importQueueItem.accountId,
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
 * Permanently deletes all data associated with an account when their Firebase auth user is deleted.
 */
export const wipeoutAccountOnAuthDelete = auth.user().onDelete(async (firebaseUser) => {
  logger.log(`[WIPEOUT] Firebase user deleted. Processing account wipeout...`, {
    fireabseUid: firebaseUser.uid,
  });

  const accountIdResult = parseAccountId(firebaseUser.uid);
  if (!accountIdResult.success) {
    logger.error(
      prefixError(accountIdResult.error, '[WIPEOUT] Invalid account ID. Not wiping out account.'),
      {firebaseUid: firebaseUser.uid}
    );
    return;
  }
  const accountId = accountIdResult.value;

  const wipeoutAccountResult = await wipeoutService.wipeoutAccount(accountId);
  if (!wipeoutAccountResult.success) {
    logger.error(prefixError(wipeoutAccountResult.error, '[WIPEOUT] Failed to wipe out account'), {
      accountId,
    });
    return;
  }

  logger.log(`[WIPEOUT] Successfully wiped out account`, {accountId});
});

/**
 * Subscribes an account to a feed source, creating it if necessary.
 */
export const subscribeAccountToFeedOnCall = onCall(
  // TODO: Lock down CORS to only allow requests from my domains.
  {cors: true},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    } else if (!request.data.url) {
      // TODO: Use zod to validate the request data.
      throw new HttpsError('invalid-argument', 'URL is required');
    }

    const accountIdResult = parseAccountId(request.auth.uid);
    if (!accountIdResult.success) {
      throw new HttpsError('invalid-argument', 'Invalid account ID');
    }
    const accountId = accountIdResult.value;

    const {url} = request.data;

    const logDetails = {url, accountId} as const;

    logger.log(`[SUBSCRIBE] Subscribing account to feed source via URL...`, logDetails);

    const subscribeToUrlResult = await rssFeedService.subscribeAccountToUrl({url, accountId});
    if (!subscribeToUrlResult.success) {
      logger.error(
        prefixError(
          subscribeToUrlResult.error,
          '[SUBSCRIBE] Error subscribing account to feed source via URL'
        ),
        logDetails
      );
      return subscribeToUrlResult;
    }

    const userFeedSubscription = subscribeToUrlResult.value;

    logger.log(`[SUBSCRIBE] Successfully subscribed account to feed source`, {
      ...logDetails,
      feedSourceId: userFeedSubscription.feedSourceId,
      userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    });

    // TODO: Is this what I want to return?
    return makeSuccessResult(undefined);
  }
);
