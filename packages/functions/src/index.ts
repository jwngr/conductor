import FirecrawlApp from '@mendable/firecrawl-js';
import {setGlobalOptions} from 'firebase-functions';
import {defineString, projectID} from 'firebase-functions/params';
import {auth} from 'firebase-functions/v1';
import {onInit} from 'firebase-functions/v2/core';
import {onDocumentCreated, onDocumentUpdated} from 'firebase-functions/v2/firestore';
import {HttpsError, onCall, onRequest} from 'firebase-functions/v2/https';

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
import {batchAsyncResults, partition} from '@shared/lib/utils.shared';

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

import {FeedItemId, makeFeedItemRSSSource} from '@shared/types/feedItems.types';
import {ImportQueueItem, ImportQueueItemStatus} from '@shared/types/importQueue.types';
import {AsyncResult, ErrorResult, SuccessResult} from '@shared/types/result.types';
import {parseSuperfeedrWebhookRequestBody} from '@shared/types/superfeedr.types';
import {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import {Supplier} from '@shared/types/utils.types';

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

// TODO: This should be an environment variable.
const FIREBASE_FUNCTIONS_REGION = 'us-central1';

let feedSourcesService: ServerFeedSourcesService;
let userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
let importQueueService: ServerImportQueueService;
let wipeoutService: WipeoutService;
let rssFeedService: ServerRssFeedService;
let feedItemsService: ServerFeedItemsService;
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
  async (request): Promise<{readonly userFeedSubscriptionId: UserFeedSubscriptionId}> => {
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
      throw new HttpsError('internal', subscribeToUrlResult.error.message);
    }

    const userFeedSubscription = subscribeToUrlResult.value;

    logger.log(`[SUBSCRIBE] Successfully subscribed account to feed source`, {
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
  // This webhook is server-to-server, so we don't need to worry about CORS.
  {cors: false},

  async (request, response) => {
    const respondWithError = (
      error: Error,
      errorPrefix = '',
      logDetails: Record<string, unknown> = {}
    ): void => {
      const betterError = prefixError(error, `[SUPERFEEDR] ${errorPrefix}`);
      logger.error(betterError, {body: request.body, ...logDetails});
      response.status(400).json({success: false, error: betterError.message});
      return;
    };

    // TODO: Validate the request is from Superfeedr by checking some auth header.

    logger.log('[SUPERFEEDR] Received webhook request', {body: JSON.stringify(request.body)});

    // Parse the request from Superfeedr.
    const parseResult = parseSuperfeedrWebhookRequestBody(request.body);
    if (!parseResult.success) {
      return respondWithError(parseResult.error, 'Error parsing webhook request');
    }

    const body = parseResult.value;
    if (body.status.code !== 200) {
      return respondWithError(new Error('Webhook callback returned non-200 status'));
    }

    // Fetch the feed source from the URL.
    const feedUrl = body.status.feed;
    const fetchFeedSourceResult = await feedSourcesService.fetchByUrl(feedUrl);
    if (!fetchFeedSourceResult.success) {
      return respondWithError(
        fetchFeedSourceResult.error,
        'Error fetching webhook feed source by URL',
        {feedUrl}
      );
    }

    const feedSource = fetchFeedSourceResult.value;
    if (!feedSource) {
      return respondWithError(new Error('No feed source found for URL. Skipping...'), undefined, {
        feedUrl,
      });
    }

    // Fetch all users subscribed to this feed source.
    const fetchSubscriptionsResult = await userFeedSubscriptionsService.fetchForFeedSource(
      feedSource.feedSourceId
    );
    if (!fetchSubscriptionsResult.success) {
      return respondWithError(
        fetchSubscriptionsResult.error,
        'Error fetching subscribed accounts',
        {feedSourceId: feedSource.feedSourceId}
      );
    }

    const userFeedSubscriptions = fetchSubscriptionsResult.value;

    // Make a list of supplier methods that create feed items.
    const createFeedItemResults: Supplier<AsyncResult<FeedItemId | null>>[] = [];
    body.items.forEach((item) => {
      logger.log(`[SUPERFEEDR] Processing item ${item.id}`, {item});

      userFeedSubscriptions.forEach((userFeedSubscription) => {
        const newFeedItemResult = async () =>
          await feedItemsService.createFeedItem({
            url: item.permalinkUrl,
            accountId: userFeedSubscription.accountId,
            feedItemSource: makeFeedItemRSSSource(userFeedSubscription.userFeedSubscriptionId),
          });
        createFeedItemResults.push(newFeedItemResult);
      });
    });

    // Execute the supplier methods in batches.
    const batchResult = await batchAsyncResults(createFeedItemResults, 10);
    if (!batchResult.success) {
      return respondWithError(batchResult.error, 'Error batching feed item creation');
    }

    // Log successes and errors.
    const newFeedItemResults = batchResult.value;
    const [newFeedItemSuccesses, newFeedItemErrors] = partition<
      SuccessResult<FeedItemId | null>,
      ErrorResult
    >(newFeedItemResults, (result): result is SuccessResult<FeedItemId | null> => result.success);
    logger.log(
      `[SUPERFEEDR] Successfully created ${newFeedItemSuccesses.length} feed items, encountered ${newFeedItemErrors.length} errors`,
      {
        successes: newFeedItemSuccesses.map((result) => result.value),
        errors: newFeedItemErrors.map((result) => result.error),
      }
    );

    if (newFeedItemErrors.length !== 0) {
      return respondWithError(new Error('Individual feed items failed to be created'), undefined, {
        errors: newFeedItemErrors.map((result) => result.error),
      });
    }

    response.status(200).json({success: true, value: undefined});
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
    const feedItemId = parseFeedItemId(event.params.feedItemId);
    if (!feedItemId.success) {
      const betterError = prefixError(feedItemId.error, 'Failed to parse feed item ID');
      logger.error(betterError, {feedItemId: event.params.feedItemId});
      return;
    }

    const feedItemData = event.data?.data();
    if (!feedItemData) {
      logger.error(new Error('No feed item data found'), {feedItemId: feedItemId.value});
      return;
    }

    const feedItemResult = parseFeedItem(feedItemData);
    if (!feedItemResult.success) {
      const betterError = prefixError(feedItemResult.error, 'Failed to parse feed item');
      logger.error(betterError, {feedItemId: feedItemId.value, feedItemData});
      return;
    }

    const feedItem = feedItemResult.value;

    const createImportQueueItemResult = await importQueueService.create({
      feedItemId: feedItem.feedItemId,
      accountId: feedItem.accountId,
      url: feedItem.url,
    });

    if (!createImportQueueItemResult.success) {
      const betterError = prefixError(
        createImportQueueItemResult.error,
        'Failed to create import queue item'
      );
      logger.error(betterError, {feedItemId: feedItem.feedItemId});
      return;
    }

    logger.warn('Successfully created import queue item', {
      feedItemId: feedItem.feedItemId,
      importQueueItemId: createImportQueueItemResult.value.importQueueItemId,
    });
  }
);

/**
 * Handles unsubscribe events when a user feed subscription is marked as inactive.
 */
export const handleFeedUnsubscribeOnUpdate = onDocumentUpdated(
  `${USER_FEED_SUBSCRIPTIONS_DB_COLLECTION}/{userFeedSubscriptionId}`,
  async (event) => {
    const {userFeedSubscriptionId: maybeUserFeedSubscriptionId} = event.params;

    // Parse the user feed subscription ID.
    const parseIdResult = parseUserFeedSubscriptionId(maybeUserFeedSubscriptionId);
    if (!parseIdResult.success) {
      logger.error(
        prefixError(parseIdResult.error, '[UNSUBSCRIBE] Invalid user feed subscription ID'),
        {maybeUserFeedSubscriptionId}
      );
      return;
    }
    const userFeedSubscriptionId = parseIdResult.value;

    // Parse the before and after data.
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) {
      logger.error(new Error('[UNSUBSCRIBE] Missing before or after data'), {
        userFeedSubscriptionId,
      });
      return;
    }

    const beforeResult = parseUserFeedSubscription(beforeData);
    const afterResult = parseUserFeedSubscription(afterData);

    if (!beforeResult.success || !afterResult.success) {
      logger.error(new Error('[UNSUBSCRIBE] Failed to parse user feed subscription data'), {
        userFeedSubscriptionId,
        beforeError: beforeResult.success ? undefined : beforeResult.error.message,
        afterError: afterResult.success ? undefined : afterResult.error.message,
      });
      return;
    }

    const before = beforeResult.value;
    const after = afterResult.value;

    // Only proceed if the subscription was marked as inactive.
    const becameInactive = before.isActive && !after.isActive;
    if (!becameInactive) return;

    const logDetails = {
      userFeedSubscriptionId,
      accountId: after.accountId,
      feedSourceId: after.feedSourceId,
      url: after.url,
    } as const;

    logger.log('[UNSUBSCRIBE] Processing unsubscribe for feed subscription', logDetails);

    const unsubscribeResult = await rssFeedService.unsubscribeAccountFromUrl({
      feedSourceId: after.feedSourceId,
      url: after.url,
      accountId: after.accountId,
    });

    if (!unsubscribeResult.success) {
      const betterError = prefixError(
        unsubscribeResult.error,
        '[UNSUBSCRIBE] Error unsubscribing account from Superfeedr feed'
      );
      logger.error(betterError, logDetails);
      return;
    }

    logger.log('[UNSUBSCRIBE] Successfully unsubscribed account from Superfeedr feed', logDetails);
  }
);
