import type {Unsubscribe} from 'firebase/firestore';
import {create} from 'zustand';

import {logger} from '@shared/services/logger.shared';

import {
  IDLE_ASYNC_STATE,
  makeErrorAsyncState,
  makeSuccessAsyncState,
  PENDING_ASYNC_STATE,
} from '@shared/lib/asyncState.shared';
import {FEED_SUBSCRIPTIONS_CACHE_LIMIT} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';
import {objectSize} from '@shared/lib/objectUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {AsyncStatus, type AsyncState} from '@shared/types/asyncState.types';
import type {FeedSubscription, FeedSubscriptionId} from '@shared/types/feedSubscriptions.types';
import type {Consumer, Func} from '@shared/types/utils.types';

import type {ClientEventLogService} from '@sharedClient/services/eventLog.client';
import {ClientFeedSubscriptionsService} from '@sharedClient/services/feedSubscriptions.client';
import type {ClientFirebaseService} from '@sharedClient/services/firebase.client';

interface FeedSubscriptionsStoreState {
  // State.
  readonly feedSubscriptionsService: ClientFeedSubscriptionsService | null;
  readonly recentSubscriptionsCacheState: AsyncState<
    Partial<Record<FeedSubscriptionId, FeedSubscription>>
  >;
  readonly isCacheReady: boolean;

  // Actions.
  readonly setFeedSubscriptionsService: Consumer<ClientFeedSubscriptionsService>;
  readonly registerService: Func<
    {
      readonly accountId: AccountId;
      readonly firebaseService: ClientFirebaseService;
      readonly eventLogService: ClientEventLogService;
    },
    Unsubscribe
  >;
  readonly getFeedSubscription: Func<FeedSubscriptionId, FeedSubscription | null>;
}

export const useFeedSubscriptionsStore = create<FeedSubscriptionsStoreState>((set, get) => ({
  // Initial state.
  feedSubscriptionsService: null,
  recentSubscriptionsCacheState: IDLE_ASYNC_STATE,
  isCacheReady: false,

  // Actions.
  setFeedSubscriptionsService: (feedSubscriptionsService) =>
    set({feedSubscriptionsService: feedSubscriptionsService}),
  registerService: (args) => {
    const {accountId, firebaseService, eventLogService} = args;

    const feedSubscriptionsService = new ClientFeedSubscriptionsService({
      accountId,
      firebaseService,
      eventLogService,
    });

    set({
      feedSubscriptionsService: feedSubscriptionsService,
      recentSubscriptionsCacheState: PENDING_ASYNC_STATE,
    });

    const unsubscribe = feedSubscriptionsService.watchSubscriptions({
      // Limit the maximum number of subscriptions to keep in memory.
      limit: FEED_SUBSCRIPTIONS_CACHE_LIMIT,
      onData: (subscriptions) => {
        // Log a warning if the cache is at the size limit.
        if (objectSize(subscriptions) === FEED_SUBSCRIPTIONS_CACHE_LIMIT) {
          const message = `Feed subscriptions cache reached limit`;
          logger.warn(message, {accountId, limit: FEED_SUBSCRIPTIONS_CACHE_LIMIT});
        }

        // Update the cache state.
        set({
          recentSubscriptionsCacheState: makeSuccessAsyncState(subscriptions),
          isCacheReady: true,
        });
      },
      onError: (error) => {
        // Log the error and set the cache state as errored.
        const message = 'Error setting up feed subscriptions listener';
        const betterError = prefixError(error, message);
        logger.error(betterError);
        set({recentSubscriptionsCacheState: makeErrorAsyncState(betterError)});
      },
    });

    return unsubscribe;
  },

  getFeedSubscription: (feedSubscriptionId) => {
    const {recentSubscriptionsCacheState} = get();

    switch (recentSubscriptionsCacheState.status) {
      case AsyncStatus.Idle:
      case AsyncStatus.Pending:
      case AsyncStatus.Error:
        return null;
      case AsyncStatus.Success: {
        const cachedSubscriptions = recentSubscriptionsCacheState.value;
        const cachedSubscription = cachedSubscriptions[feedSubscriptionId];

        // TODO: If not in the cache, consider fetching from the server and adding to the cache.
        // But then need to handle future updates since it is not captured by the main listener.
        if (!cachedSubscription) return null;

        return cachedSubscription;
      }
      default:
        assertNever(recentSubscriptionsCacheState);
    }
  },
}));
