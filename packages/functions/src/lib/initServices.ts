import FirecrawlApp from '@mendable/firecrawl-js';
import {logger} from 'firebase-functions';
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
    return prefixErrorResult(
      parsedFeedProviderTypeResult,
      `Invalid RSS feed provider type: "${rawRssFeedProviderType}". Make sure RSS_FEED_PROVIDER_TYPE is set.`
    );
  }

  const feedProviderType = parsedFeedProviderTypeResult.value;

  // TODO: Consider using a different callback URL for the local feed provider.
  const callbackUrl = `${getFunctionsBaseUrl()}/handleSuperfeedrWebhook`;

  const rssServerPort = parseInt(LOCAL_RSS_FEED_PROVIDER_PORT.value() ?? '', 10);
  if (isNaN(rssServerPort) || !isValidPort(rssServerPort)) {
    const error = new Error(
      'RSS feed provider port is not valid. Make sure LOCAL_RSS_FEED_PROVIDER_PORT is set in .env'
    );
    logger.error(error, {port: rssServerPort});
    return makeErrorResult(error);
  }

  let rssFeedProvider: RssFeedProvider;
  switch (feedProviderType) {
    case 'local':
      rssFeedProvider = new LocalRssFeedProvider({
        port: rssServerPort,
        callbackUrl,
      });
      break;
    case 'superfeedr':
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
export function initServices(): {
  readonly feedSourcesService: ServerFeedSourcesService;
  readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
  readonly wipeoutService: WipeoutService;
  readonly rssFeedService: ServerRssFeedService;
  readonly feedItemsService: ServerFeedItemsService;
} {
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
    logger.error(rssFeedProviderResult.error);
    // This is considered a fatal error, so allow this to throw.
    // eslint-disable-next-line no-restricted-syntax
    throw rssFeedProviderResult.error;
  }

  const rssFeedService = new ServerRssFeedService({
    rssFeedProvider: rssFeedProviderResult.value,
    feedSourcesService,
    userFeedSubscriptionsService,
  });

  return {
    feedSourcesService,
    userFeedSubscriptionsService,
    wipeoutService,
    rssFeedService,
    feedItemsService,
  };
}
