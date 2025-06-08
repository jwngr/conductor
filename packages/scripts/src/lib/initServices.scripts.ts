import FirecrawlApp from '@mendable/firecrawl-js';

import {FEED_ITEMS_STORAGE_COLLECTION} from '@shared/lib/constants.shared';

import {Environment} from '@shared/types/environment.types';

import {ServerEventLogService} from '@sharedServer/services/eventLog.server';
import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';

import {firebaseService} from '@src/lib/firebase.scripts';

interface InitializedServices {
  readonly feedItemsService: ServerFeedItemsService;
}

export const initServices = (args: {readonly firecrawlApiKey: string}): InitializedServices => {
  const {firecrawlApiKey} = args;

  // Event log service.
  const eventLogService = new ServerEventLogService({
    firebaseService,
    environment: Environment.Scripts,
  });

  // Firecrawl service.
  const firecrawlApp = new FirecrawlApp({apiKey: firecrawlApiKey});
  const firecrawlService = new ServerFirecrawlService({firecrawlApp});

  // Feed items service .
  const feedItemsService = new ServerFeedItemsService({
    firebaseService,
    storageCollectionPath: FEED_ITEMS_STORAGE_COLLECTION,
    firecrawlService,
    eventLogService,
  });

  return {
    feedItemsService,
  };
};
