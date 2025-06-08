import type {AccountId} from '@shared/types/accounts.types';
import {Environment} from '@shared/types/environment.types';

import {ClientEventLogService} from '@sharedClient/services/eventLog.client';
import {ClientFeedItemsService} from '@sharedClient/services/feedItems.client';

import {firebaseService} from '@src/lib/firebase.ext';

interface InitializedServices {
  readonly feedItemsService: ClientFeedItemsService;
}

export function initServices(args: {readonly accountId: AccountId}): InitializedServices {
  const {accountId} = args;

  // Event log service.
  const eventLogService = new ClientEventLogService({
    accountId,
    environment: Environment.Extension,
    firebaseService,
  });

  // Feed items service.
  const feedItemsService = new ClientFeedItemsService({
    accountId,
    eventLogService,
    firebaseService,
  });

  return {feedItemsService};
}
