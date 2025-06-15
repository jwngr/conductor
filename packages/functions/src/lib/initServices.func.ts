import FirecrawlApp from '@mendable/firecrawl-js';
import {defineString} from 'firebase-functions/params';

import {FEED_ITEMS_STORAGE_COLLECTION} from '@shared/lib/constants.shared';
import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {Environment} from '@shared/types/environment.types';
import type {Result} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';

import {ServerAccountsService} from '@sharedServer/services/accounts.server';
import {ServerAccountSettingsService} from '@sharedServer/services/accountSettings.server';
import {ServerEventLogService} from '@sharedServer/services/eventLog.server';
import {ServerExperimentsService} from '@sharedServer/services/experiments.server';
import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';
import {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';
import {WipeoutService} from '@sharedServer/services/wipeout.server';

import {getInternalAccountEmailAddress} from '@src/lib/environment.func';
import {firebaseService} from '@src/lib/firebase.func';
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

export function initServices(): Result<InitializedServices, Error> {
  // User feed subscriptions.
  const userFeedSubscriptionsService = new ServerUserFeedSubscriptionsService({
    firebaseService,
  });

  // Event log service.
  const eventLogService = new ServerEventLogService({
    firebaseService,
    environment: ENVIRONMENT,
  });

  // Firecrawl service.
  const firecrawlApp = new FirecrawlApp({apiKey: FIRECRAWL_API_KEY.value()});
  const firecrawlService = new ServerFirecrawlService({firecrawlApp});

  // Feed items service.
  const feedItemsService = new ServerFeedItemsService({
    firebaseService,
    storageCollectionPath: FEED_ITEMS_STORAGE_COLLECTION,
    eventLogService,
    firecrawlService,
  });

  // Account experiments service.
  const experimentsService = new ServerExperimentsService({
    firebaseService,
    internalAccountEmails: [getInternalAccountEmailAddress()],
  });

  // Account settings service.
  const accountSettingsService = new ServerAccountSettingsService({
    firebaseService,
  });

  // Accounts service.
  const accountsService = new ServerAccountsService({
    firebaseService,
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

  const rssFeedService = new ServerRssFeedService({rssFeedProvider, userFeedSubscriptionsService});

  return makeSuccessResult({
    userFeedSubscriptionsService,
    accountsService,
    wipeoutService,
    rssFeedService,
    feedItemsService,
    rssFeedProvider,
  });
}
