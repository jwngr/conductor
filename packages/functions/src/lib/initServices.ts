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
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever, isValidPort} from '@shared/lib/utils.shared';

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

import type {Result} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';
import type {SuperfeedrCredentials} from '@shared/types/superfeedr.types';

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

import {getFunctionsBaseUrl} from '@src/lib/env';

const FIRECRAWL_API_KEY = defineString('FIRECRAWL_API_KEY');
const LOCAL_RSS_FEED_PROVIDER_PORT = defineString('LOCAL_RSS_FEED_PROVIDER_PORT');
const RSS_FEED_PROVIDER_TYPE = defineString('RSS_FEED_PROVIDER_TYPE');
const SUPERFEEDR_USER = defineString('SUPERFEEDR_USER');
const SUPERFEEDR_API_KEY = defineString('SUPERFEEDR_API_KEY');

function getRssFeedProvider(): Result<RssFeedProvider> {
  const rawRssFeedProviderType = RSS_FEED_PROVIDER_TYPE.value();
  const parsedFeedProviderTypeResult = parseRssFeedProviderType(rawRssFeedProviderType);
  if (!parsedFeedProviderTypeResult.success) {
    const message = `RSS_FEED_PROVIDER_TYPE environment variable has invalid value: "${rawRssFeedProviderType}"`;
    return prefixErrorResult(parsedFeedProviderTypeResult, message);
  }

  const feedProviderType = parsedFeedProviderTypeResult.value;

  switch (feedProviderType) {
    case 'local':
      return getLocalRssFeedProvider();
    case 'superfeedr':
      return getSuperfeedrRssFeedProvider();
    default: {
      assertNever(feedProviderType);
    }
  }
}

function getLocalRssFeedProvider(): Result<RssFeedProvider> {
  // TODO: Consider using a different callback URL for the local feed provider.
  const callbackUrl = `${getFunctionsBaseUrl()}/handleSuperfeedrWebhook`;

  const port = parseInt(LOCAL_RSS_FEED_PROVIDER_PORT.value() ?? '', 10);
  if (isNaN(port) || !isValidPort(port)) {
    const message = `LOCAL_RSS_FEED_PROVIDER_PORT environment variable has invalid value: "${port}"`;
    return makeErrorResult(new Error(message));
  }

  const rssFeedProvider = new LocalRssFeedProvider({port, callbackUrl});

  return makeSuccessResult(rssFeedProvider);
}

function getSuperfeedrRssFeedProvider(): Result<RssFeedProvider> {
  const callbackUrl = `${getFunctionsBaseUrl()}/handleSuperfeedrWebhook`;

  const credentialsResult = validateSuperfeedrCredentials();
  if (!credentialsResult.success) {
    const message = 'Failed to initialize Superfeedr RSS feed provider';
    return prefixErrorResult(credentialsResult, message);
  }

  const credentials = credentialsResult.value;
  const rssFeedProvider = new SuperfeedrService({
    superfeedrUser: credentials.user,
    superfeedrApiKey: credentials.apiKey,
    callbackUrl,
  });

  return makeSuccessResult(rssFeedProvider);
}

function validateSuperfeedrCredentials(): Result<SuperfeedrCredentials> {
  const rawSuperfeedrUser = SUPERFEEDR_USER.value();
  const rawSuperfeedrApiKey = SUPERFEEDR_API_KEY.value();

  if (rawSuperfeedrUser.length === 0) {
    const message = 'SUPERFEEDR_USER environment variable must be set when Superfeedr enabled';
    return makeErrorResult(new Error(message));
  }

  if (rawSuperfeedrApiKey.length === 0) {
    const message = 'SUPERFEEDR_API_KEY environment variable must be set when Superfeedr enabled';
    return makeErrorResult(new Error(message));
  }

  return makeSuccessResult({
    user: rawSuperfeedrUser,
    apiKey: rawSuperfeedrApiKey,
  });
}

interface InitializedServices {
  readonly feedSourcesService: ServerFeedSourcesService;
  readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
  readonly wipeoutService: WipeoutService;
  readonly rssFeedService: ServerRssFeedService;
  readonly feedItemsService: ServerFeedItemsService;
}

export function initServices(): Result<InitializedServices> {
  const feedSourceFirestoreConverter = makeFirestoreDataConverter(
    toStorageFeedSource,
    parseFeedSource
  );

  const feedSourcesCollectionService = new ServerFirestoreCollectionService({
    collectionPath: FEED_SOURCES_DB_COLLECTION,
    converter: feedSourceFirestoreConverter,
    parseId: parseFeedSourceId,
  });

  const feedSourcesService = new ServerFeedSourcesService({feedSourcesCollectionService});

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
