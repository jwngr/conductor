import type {Unsubscribe} from 'firebase/firestore';
import {create} from 'zustand';

import {logger} from '@shared/services/logger.shared';

import {
  IDLE_ASYNC_STATE,
  makeErrorAsyncState,
  makeSuccessAsyncState,
  PENDING_ASYNC_STATE,
} from '@shared/lib/asyncState.shared';
import {USER_FEED_SUBSCRIPTIONS_CACHE_LIMIT} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';
import {objectSize} from '@shared/lib/objectUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {AsyncStatus, type AsyncState} from '@shared/types/asyncState.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import type {Consumer} from '@shared/types/utils.types';

import type {ClientEventLogService} from '@sharedClient/services/eventLog.client';
import type {ClientFirebaseService} from '@sharedClient/services/firebase.client';
import {ClientUserFeedSubscriptionsService} from '@sharedClient/services/userFeedSubscriptions.client';

interface UserFeedSubscriptionsStoreState {
  // State.
  readonly userFeedSubscriptionsService: ClientUserFeedSubscriptionsService | null;
  readonly recentSubscriptionsCacheState: AsyncState<
    Partial<Record<UserFeedSubscriptionId, UserFeedSubscription>>
  >;
  readonly isCacheReady: boolean;

  // Actions.
  readonly setUserFeedSubscriptionsService: Consumer<ClientUserFeedSubscriptionsService>;
  readonly registerService: (args: {
    readonly accountId: AccountId;
    readonly firebaseService: ClientFirebaseService;
    readonly eventLogService: ClientEventLogService;
  }) => Unsubscribe;
  readonly getFeedSubscription: (
    userFeedSubscriptionId: UserFeedSubscriptionId
  ) => UserFeedSubscription | null;
}

export const useUserFeedSubscriptionsStore = create<UserFeedSubscriptionsStoreState>(
  (set, get) => ({
    // Initial state.
    userFeedSubscriptionsService: null,
    recentSubscriptionsCacheState: IDLE_ASYNC_STATE,
    isCacheReady: false,

    // Actions.
    setUserFeedSubscriptionsService: (userFeedSubscriptionsService) =>
      set({userFeedSubscriptionsService}),
    registerService: (args) => {
      const {accountId, firebaseService, eventLogService} = args;

      const userFeedSubscriptionsService = new ClientUserFeedSubscriptionsService({
        accountId,
        firebaseService,
        eventLogService,
      });

      set({
        userFeedSubscriptionsService: userFeedSubscriptionsService,
        recentSubscriptionsCacheState: PENDING_ASYNC_STATE,
      });

      const unsubscribe = userFeedSubscriptionsService.watchSubscriptions({
        // Limit the maximum number of subscriptions to keep in memory.
        limit: USER_FEED_SUBSCRIPTIONS_CACHE_LIMIT,
        onData: (subscriptions) => {
          // Log a warning if the cache is at the size limit.
          if (objectSize(subscriptions) === USER_FEED_SUBSCRIPTIONS_CACHE_LIMIT) {
            const message = `User feed subscriptions cache reached limit`;
            logger.warn(message, {accountId, limit: USER_FEED_SUBSCRIPTIONS_CACHE_LIMIT});
          }

          // Update the cache state.
          set({
            recentSubscriptionsCacheState: makeSuccessAsyncState(subscriptions),
            isCacheReady: true,
          });
        },
        onError: (error) => {
          // Log the error and set the cache state as errored.
          const message = 'Error setting up user feed subscriptions listener';
          const betterError = prefixError(error, message);
          logger.error(betterError);
          set({recentSubscriptionsCacheState: makeErrorAsyncState(betterError)});
        },
      });

      return unsubscribe;
    },

    getFeedSubscription: (userFeedSubscriptionId) => {
      const {recentSubscriptionsCacheState} = get();

      switch (recentSubscriptionsCacheState.status) {
        case AsyncStatus.Idle:
        case AsyncStatus.Pending:
        case AsyncStatus.Error:
          return null;
        case AsyncStatus.Success: {
          const cachedSubscriptions = recentSubscriptionsCacheState.value;
          const cachedSubscription = cachedSubscriptions[userFeedSubscriptionId];

          // TODO: If not in the cache, consider fetching from the server and adding to the cache.
          // But then need to handle future updates since it is not captured by the main listener.
          if (!cachedSubscription) return null;

          return cachedSubscription;
        }
        default:
          assertNever(recentSubscriptionsCacheState);
      }
    },
  })
);
