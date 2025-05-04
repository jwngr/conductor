import {limit, orderBy, where} from 'firebase/firestore';
import type {Functions, HttpsCallable} from 'firebase/functions';
import {httpsCallable} from 'firebase/functions';
import {useEffect, useMemo, useState} from 'react';

import {USER_FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {asyncTry, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
  toStorageUserFeedSubscription,
} from '@shared/parsers/userFeedSubscriptions.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';

import {firebaseService} from '@sharedClient/services/firebase.client';
import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

interface SubscribeToFeedRequest {
  readonly url: string;
}

interface SubscribeToFeedResponse {
  readonly userFeedSubscriptionId: string;
}

type CallSubscribeUserToFeedFn = HttpsCallable<SubscribeToFeedRequest, SubscribeToFeedResponse>;

type UserFeedSubscriptionsCollectionService = ClientFirestoreCollectionService<
  UserFeedSubscriptionId,
  UserFeedSubscription
>;

export class ClientUserFeedSubscriptionsService {
  private readonly accountId: AccountId;
  private readonly functions: Functions;
  private readonly userFeedSubscriptionsCollectionService: UserFeedSubscriptionsCollectionService;

  constructor(args: {
    readonly accountId: AccountId;
    readonly functions: Functions;
    readonly userFeedSubscriptionsCollectionService: UserFeedSubscriptionsCollectionService;
  }) {
    this.accountId = args.accountId;
    this.functions = args.functions;
    this.userFeedSubscriptionsCollectionService = args.userFeedSubscriptionsCollectionService;
  }

  /**
   * Subscribes the account to the URL, creating a new feed source if necessary.
   *
   * This is done via Firebase Functions since managing feed sources is a privileged operation.
   */
  public async subscribeToUrl(url: string): AsyncResult<UserFeedSubscriptionId> {
    const callSubscribeAccountToFeed: CallSubscribeUserToFeedFn = httpsCallable(
      this.functions,
      'subscribeAccountToFeedOnCall'
    );

    // Hit Firebase Functions endpoint to subscribe account to feed source.
    const subscribeResponseResult = await asyncTry(async () => callSubscribeAccountToFeed({url}));
    if (!subscribeResponseResult.success) return subscribeResponseResult;
    const subscribeResponse = subscribeResponseResult.value;

    // TODO: Parse and validate the response from the function.

    // Parse the response to get the new user feed subscription ID.
    const idResult = parseUserFeedSubscriptionId(subscribeResponse.data.userFeedSubscriptionId);
    return prefixResultIfError(idResult, 'New user feed subscription ID did not parse correctly');
  }

  /**
   * Updates a user feed subscription document in Firestore.
   */
  public async updateSubscription(
    userFeedSubscriptionId: UserFeedSubscriptionId,
    update: Partial<Pick<UserFeedSubscription, 'isActive' | 'unsubscribedTime'>>
  ): AsyncResult<void> {
    const updateResult = await this.userFeedSubscriptionsCollectionService.updateDoc(
      userFeedSubscriptionId,
      update
    );
    return prefixResultIfError(updateResult, 'Error updating user feed subscription');
  }

  // TODO: Implement this.
  // public async unsubscribeFromFeedUrl(url: string): AsyncResult<void> {
  //   return makeSuccessResult(undefined);
  // }

  /**
   * Watches updates for an individual user feed subscription.
   */
  public watchSubscription(args: {
    readonly userFeedSubscriptionId: UserFeedSubscriptionId;
    readonly successCallback: Consumer<UserFeedSubscription | null>;
    readonly errorCallback: Consumer<Error>;
  }): Unsubscribe {
    const {userFeedSubscriptionId, successCallback, errorCallback} = args;

    const unsubscribe = this.userFeedSubscriptionsCollectionService.watchDoc(
      userFeedSubscriptionId,
      successCallback,
      errorCallback
    );
    return () => unsubscribe();
  }

  /**
   * Watches updates for all user feed subscriptions.
   */
  public watchAllSubscriptions(args: {
    readonly successCallback: Consumer<UserFeedSubscription[]>;
    readonly errorCallback: Consumer<Error>;
  }): Unsubscribe {
    const {successCallback, errorCallback} = args;

    const itemsQuery = this.userFeedSubscriptionsCollectionService.query([
      where('accountId', '==', this.accountId),
      orderBy('createdTime', 'desc'),
      limit(100),
    ]);

    const unsubscribe = this.userFeedSubscriptionsCollectionService.watchDocs(
      itemsQuery,
      successCallback,
      errorCallback
    );
    return () => unsubscribe();
  }
}

const userFeedSubscriptionFirestoreConverter = makeFirestoreDataConverter(
  toStorageUserFeedSubscription,
  parseUserFeedSubscription
);

const userFeedSubscriptionsCollectionService = new ClientFirestoreCollectionService({
  collectionPath: USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
  converter: userFeedSubscriptionFirestoreConverter,
  parseId: parseUserFeedSubscriptionId,
});

export function useUserFeedSubscriptionsService(): ClientUserFeedSubscriptionsService {
  const loggedInAccount = useLoggedInAccount();

  const userFeedSubscriptionsService = useMemo(() => {
    return new ClientUserFeedSubscriptionsService({
      accountId: loggedInAccount.accountId,
      functions: firebaseService.functions,
      userFeedSubscriptionsCollectionService,
    });
  }, [loggedInAccount.accountId]);

  return userFeedSubscriptionsService;
}

interface UserFeedSubscriptionsState {
  readonly subscriptions: UserFeedSubscription[];
  readonly isLoading: boolean;
  readonly error: Error | null;
}

const INITIAL_USER_FEED_SUBSCRIPTIONS_STATE: UserFeedSubscriptionsState = {
  subscriptions: [],
  isLoading: true,
  error: null,
} as const;

export const useUserFeedSubscriptions = (): UserFeedSubscriptionsState => {
  const [state, setState] = useState<UserFeedSubscriptionsState>(
    INITIAL_USER_FEED_SUBSCRIPTIONS_STATE
  );
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  useEffect(() => {
    const unsubscribe = userFeedSubscriptionsService.watchAllSubscriptions({
      successCallback: (updatedSubscriptions) => {
        setState((current) => ({
          ...current,
          subscriptions: updatedSubscriptions,
          isLoading: false,
          error: null,
        }));
      },
      errorCallback: (error) => {
        setState((current) => ({
          ...current,
          isLoading: false,
          error,
        }));
      },
    });

    return () => unsubscribe();
  }, [userFeedSubscriptionsService]);

  return state;
};
