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

import {parseAccount, parseAccountId, toStorageAccount} from '@shared/parsers/accounts.parser';
import {
  parseAccountSettings,
  toStorageAccountSettings,
} from '@shared/parsers/accountSettings.parser';
import {
  parseEventId,
  parseEventLogItem,
  toStorageEventLogItem,
} from '@shared/parsers/eventLog.parser';
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

import {ServerAccountsService} from '@sharedServer/services/accounts.server';
import {ServerAccountSettingsService} from '@sharedServer/services/accountSettings.server';
import {ServerEventLogService} from '@sharedServer/services/eventLog.server';
import {ServerExperimentsService} from '@sharedServer/services/experiments.server';
import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import {
  makeFirestoreDataConverter,
  ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';
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
  const userFeedSubscriptionFirestoreConverter = makeFirestoreDataConverter(
    toStorageUserFeedSubscription,
    parseUserFeedSubscription
  );

  const userFeedSubscriptionsCollectionService = new ServerFirestoreCollectionService({
    collectionPath: USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
    converter: userFeedSubscriptionFirestoreConverter,
    parseId: parseUserFeedSubscriptionId,
  });

  const userFeedSubscriptionsService = new ServerUserFeedSubscriptionsService({
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

  const eventLogItemFirestoreConverter = makeFirestoreDataConverter(
    toStorageEventLogItem,
    parseEventLogItem
  );

  const eventLogCollectionService = new ServerFirestoreCollectionService({
    collectionPath: EVENT_LOG_DB_COLLECTION,
    converter: eventLogItemFirestoreConverter,
    parseId: parseEventId,
  });

  const eventLogService = new ServerEventLogService({
    environment: ENVIRONMENT,
    eventLogCollectionService,
  });

  const feedItemsService = new ServerFeedItemsService({
    feedItemsCollectionService,
    storageCollectionPath: FEED_ITEMS_STORAGE_COLLECTION,
    eventLogService,
    firecrawlService,
  });

  const accountExperimentsFirestoreConverter = makeFirestoreDataConverter(
    toStorageAccountExperimentsState,
    parseAccountExperimentsState
  );

  const accountExperimentsCollectionService = new ServerFirestoreCollectionService({
    collectionPath: ACCOUNT_EXPERIMENTS_DB_COLLECTION,
    converter: accountExperimentsFirestoreConverter,
    parseId: parseAccountId,
  });

  const experimentsService = new ServerExperimentsService({
    accountExperimentsCollectionService: accountExperimentsCollectionService,
  });

  const accountSettingsFirestoreConverter = makeFirestoreDataConverter(
    toStorageAccountSettings,
    parseAccountSettings
  );

  const accountSettingsCollectionService = new ServerFirestoreCollectionService({
    collectionPath: ACCOUNT_SETTINGS_DB_COLLECTION,
    converter: accountSettingsFirestoreConverter,
    parseId: parseAccountId,
  });

  const accountSettingsService = new ServerAccountSettingsService({
    accountSettingsCollectionService,
  });

  const accountFirestoreConverter = makeFirestoreDataConverter(toStorageAccount, parseAccount);

  const accountsCollectionService = new ServerFirestoreCollectionService({
    collectionPath: ACCOUNTS_DB_COLLECTION,
    converter: accountFirestoreConverter,
    parseId: parseAccountId,
  });

  const accountsService = new ServerAccountsService({
    accountsCollectionService,
    accountSettingsService,
    experimentsService,
  });

  const wipeoutService = new WipeoutService({
    accountsService,
    userFeedSubscriptionsService,
    feedItemsService,
  });

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
