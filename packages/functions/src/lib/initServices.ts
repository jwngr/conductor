import FirecrawlApp from '@mendable/firecrawl-js';
import {defineString} from 'firebase-functions/params';

import {
  ACCOUNTS_DB_COLLECTION,
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  FEED_SOURCES_DB_COLLECTION,
  USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
} from '@shared/lib/constants.shared';
import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

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

import type {
  FeedSource,
  FeedSourceFromStorage,
  FeedSourceId,
} from '@shared/types/feedSources.types';
import type {Result} from '@shared/types/results.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionFromStorage,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

import {ServerAccountsService} from '@sharedServer/services/accounts.server';
import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFeedSourcesService} from '@sharedServer/services/feedSources.server';
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

interface InitializedServices {
  readonly feedSourcesService: ServerFeedSourcesService;
  readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
  readonly wipeoutService: WipeoutService;
  readonly rssFeedService: ServerRssFeedService;
  readonly feedItemsService: ServerFeedItemsService;
}

export function initServices(): Result<InitializedServices> {
  const feedSourceFirestoreConverter = makeFirestoreDataConverter(
    // Only allow persisted feed sources (not PWA, Extension, PocketExport)
    // Use the same toStorageFeedSource and parseFeedSource, but cast types to restrict to persisted
    toStorageFeedSource,
    parseFeedSource
  );

  const feedSourcesCollectionService = new ServerFirestoreCollectionService<
    FeedSourceId,
    FeedSource,
    FeedSourceFromStorage
  >({
    collectionPath: FEED_SOURCES_DB_COLLECTION,
    converter: feedSourceFirestoreConverter,
    parseId: parseFeedSourceId,
  });

  const feedSourcesService = new ServerFeedSourcesService({feedSourcesCollectionService});

  const userFeedSubscriptionFirestoreConverter = makeFirestoreDataConverter(
    toStorageUserFeedSubscription,
    parseUserFeedSubscription
  );

  const userFeedSubscriptionsCollectionService = new ServerFirestoreCollectionService<
    UserFeedSubscriptionId,
    UserFeedSubscription,
    UserFeedSubscriptionFromStorage
  >({
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

  const feedItemsService = new ServerFeedItemsService({
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

  const wipeoutService = new WipeoutService({
    accountsService: new ServerAccountsService({accountsCollectionService}),
    userFeedSubscriptionsService,
    feedItemsService,
  });

  const rssFeedProviderResult = getRssFeedProvider();
  if (!rssFeedProviderResult.success) {
    return prefixErrorResult(rssFeedProviderResult, 'Failed to initialize RSS feed provider');
  }

  const rssFeedService = new ServerRssFeedService({
    rssFeedProvider: rssFeedProviderResult.value,
    feedSourcesService,
    userFeedSubscriptionsService,
  });

  return makeSuccessResult({
    feedSourcesService,
    userFeedSubscriptionsService,
    wipeoutService,
    rssFeedService,
    feedItemsService,
  });
}
