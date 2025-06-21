import FirecrawlApp from '@mendable/firecrawl-js';

import {FEED_ITEMS_STORAGE_COLLECTION} from '@shared/lib/constants.shared';

import {Environment} from '@shared/types/environment.types';

import {ServerAccountsService} from '@sharedServer/services/accounts.server';
import {ServerAccountSettingsService} from '@sharedServer/services/accountSettings.server';
import {ServerEventLogService} from '@sharedServer/services/eventLog.server';
import {ServerExperimentsService} from '@sharedServer/services/experiments.server';
import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFeedSubscriptionsService} from '@sharedServer/services/feedSubscriptions.server';
import {ServerFirebaseService} from '@sharedServer/services/firebase.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';

import {env} from '@src/lib/environment.scripts';

interface InitializedServices {
  readonly firebaseService: ServerFirebaseService;
  readonly accountsService: ServerAccountsService;
  readonly feedItemsService: ServerFeedItemsService;
  readonly feedSubscriptionsService: ServerFeedSubscriptionsService;
}

export const initServices = (args: {readonly firecrawlApiKey: string}): InitializedServices => {
  const {firecrawlApiKey} = args;

  // Firebase service.
  const firebaseService = new ServerFirebaseService();

  // Accounts service.
  const accountSettingsService = new ServerAccountSettingsService({firebaseService});
  const experimentsService = new ServerExperimentsService({
    firebaseService,
    // TODO: Make this a CLI config.
    internalAccountEmails: [env.localEmailAddress],
  });
  const accountsService = new ServerAccountsService({
    firebaseService,
    accountSettingsService,
    experimentsService,
  });

  // Event log service.
  const eventLogService = new ServerEventLogService({
    firebaseService,
    environment: Environment.Scripts,
  });

  // Firecrawl service.
  const firecrawlApp = new FirecrawlApp({apiKey: firecrawlApiKey});
  const firecrawlService = new ServerFirecrawlService({firecrawlApp});

  // Feed subscriptions service.
  const feedSubscriptionsService = new ServerFeedSubscriptionsService({firebaseService});

  // Feed items service.
  const feedItemsService = new ServerFeedItemsService({
    firebaseService,
    storageCollectionPath: FEED_ITEMS_STORAGE_COLLECTION,
    firecrawlService,
    eventLogService,
  });

  return {
    firebaseService,
    accountsService,
    feedItemsService,
    feedSubscriptionsService,
  };
};
