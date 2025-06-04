import FirecrawlApp from '@mendable/firecrawl-js';
import {defineString} from 'firebase-functions/params';

import {
  ACCOUNT_EXPERIMENTS_DB_COLLECTION,
  ACCOUNT_SETTINGS_DB_COLLECTION,
  ACCOUNTS_DB_COLLECTION,
  EVENT_LOG_DB_COLLECTION,
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
} from '@shared/lib/constants.shared';
import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {parseAccount, parseAccountId} from '@shared/parsers/accounts.parser';
import {
  parseAccountSettings,
  toStorageAccountSettings,
} from '@shared/parsers/accountSettings.parser';
import {parseEventId, parseEventLogItem} from '@shared/parsers/eventLog.parser';
import {
  parseAccountExperimentsState,
  toStorageAccountExperimentsState,
} from '@shared/parsers/experiments.parser';
import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';
import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
  toStorageUserFeedSubscription,
} from '@shared/parsers/userFeedSubscriptions.parser';

import {Environment} from '@shared/types/environment.types';
import type {Result} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';

import {toStorageAccount} from '@shared/storage/accounts.storage';
import {toStorageEventLogItem} from '@shared/storage/eventLog.storage';

import {ServerAccountsService} from '@sharedServer/services/accounts.server';
import {ServerAccountSettingsService} from '@sharedServer/services/accountSettings.server';
import {ServerEventLogService} from '@sharedServer/services/eventLog.server';
import {ServerExperimentsService} from '@sharedServer/services/experiments.server';
import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import {makeServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';
import {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';
import {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';
import {WipeoutService} from '@sharedServer/services/wipeout.server';

import {getRssFeedProvider} from '@src/lib/rssFeedProvider.func';

const FIRECRAWL_API_KEY = defineString('FIRECRAWL_API_KEY');
const ENVIRONMENT = Environment.FirebaseFunctions;

interface InitializedServices {
  readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
  readonly accountsService: ServerAccountsService;
  readonly wipeoutService: WipeoutService;
  readonly rssFeedService: ServerRssFeedService;
  readonly feedItemsService: ServerFeedItemsService;
  readonly rssFeedProvider: RssFeedProvider;
}

export function initServices(): Result<InitializedServices> {
  // User feed subscriptions.
  const userFeedSubscriptionsCollectionService = makeServerFirestoreCollectionService({
    collectionPath: USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
    parseId: parseUserFeedSubscriptionId,
    toStorage: toStorageUserFeedSubscription,
    fromStorage: parseUserFeedSubscription,
  });

  const userFeedSubscriptionsService = new ServerUserFeedSubscriptionsService({
    collectionService: userFeedSubscriptionsCollectionService,
  });

  // Event log service.
  const eventLogCollectionService = makeServerFirestoreCollectionService({
    collectionPath: EVENT_LOG_DB_COLLECTION,
    toStorage: toStorageEventLogItem,
    fromStorage: parseEventLogItem,
    parseId: parseEventId,
  });

  const eventLogService = new ServerEventLogService({
    environment: ENVIRONMENT,
    collectionService: eventLogCollectionService,
  });

  // Firecrawl service.
  const firecrawlApp = new FirecrawlApp({apiKey: FIRECRAWL_API_KEY.value()});
  const firecrawlService = new ServerFirecrawlService(firecrawlApp);

  // Feed items service.
  const feedItemsCollectionService = makeServerFirestoreCollectionService({
    collectionPath: FEED_ITEMS_DB_COLLECTION,
    toStorage: toStorageFeedItem,
    fromStorage: parseFeedItem,
    parseId: parseFeedItemId,
  });

  const feedItemsService = new ServerFeedItemsService({
    collectionService: feedItemsCollectionService,
    storageCollectionPath: FEED_ITEMS_STORAGE_COLLECTION,
    eventLogService,
    firecrawlService,
  });

  // Account experiments service.
  const accountExperimentsCollectionService = makeServerFirestoreCollectionService({
    collectionPath: ACCOUNT_EXPERIMENTS_DB_COLLECTION,
    parseId: parseAccountId,
    toStorage: toStorageAccountExperimentsState,
    fromStorage: parseAccountExperimentsState,
  });

  const experimentsService = new ServerExperimentsService({
    collectionService: accountExperimentsCollectionService,
  });

  // Account settings service.
  const accountSettingsCollectionService = makeServerFirestoreCollectionService({
    collectionPath: ACCOUNT_SETTINGS_DB_COLLECTION,
    parseId: parseAccountId,
    toStorage: toStorageAccountSettings,
    fromStorage: parseAccountSettings,
  });

  const accountSettingsService = new ServerAccountSettingsService({
    collectionService: accountSettingsCollectionService,
  });

  // Accounts service.
  const accountsCollectionService = makeServerFirestoreCollectionService({
    collectionPath: ACCOUNTS_DB_COLLECTION,
    toStorage: toStorageAccount,
    fromStorage: parseAccount,
    parseId: parseAccountId,
  });

  const accountsService = new ServerAccountsService({
    collectionService: accountsCollectionService,
    accountSettingsService,
    experimentsService,
  });

  // Wipeout service.
  const wipeoutService = new WipeoutService({
    accountsService,
    userFeedSubscriptionsService,
    feedItemsService,
  });

  // RSS feed provider service.
  const rssFeedProviderResult = getRssFeedProvider();
  if (!rssFeedProviderResult.success) {
    return prefixErrorResult(rssFeedProviderResult, 'Failed to initialize RSS feed provider');
  }
  const rssFeedProvider = rssFeedProviderResult.value;

  const rssFeedService = new ServerRssFeedService({
    rssFeedProvider,
    userFeedSubscriptionsService,
  });

  return makeSuccessResult({
    userFeedSubscriptionsService,
    accountsService,
    wipeoutService,
    rssFeedService,
    feedItemsService,
    rssFeedProvider,
  });
}
