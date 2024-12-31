import {limit, orderBy, where} from 'firebase/firestore';
import type {Functions, HttpsCallableResult} from 'firebase/functions';
import {httpsCallable} from 'firebase/functions';
import {useMemo} from 'react';

import {USER_FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {asyncTry, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
  toFirestoreUserFeedSubscription,
} from '@shared/parsers/userFeedSubscriptions.parser';

import type {AsyncResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import type {AsyncFunc, Consumer, Unsubscribe} from '@shared/types/utils.types';

import {firebaseService} from '@sharedClient/services/firebase.client';
import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';

import {useLoggedInUser} from '@sharedClient/hooks/auth.hooks';

interface SubscribeToFeedRequest {
  readonly url: string;
}

interface SubscribeToFeedResponse {
  readonly userFeedSubscriptionId: string;
}

type CallSubscribeUserToFeedFn = AsyncFunc<
  SubscribeToFeedRequest,
  HttpsCallableResult<SubscribeToFeedResponse>
>;

type UserFeedSubscriptionsCollectionService = ClientFirestoreCollectionService<
  UserFeedSubscriptionId,
  UserFeedSubscription
>;

export class ClientUserFeedSubscriptionsService {
  private userId: UserId;
  private functions: Functions;
  private userFeedSubscriptionsCollectionService: UserFeedSubscriptionsCollectionService;

  constructor(args: {
    readonly userId: UserId;
    readonly functions: Functions;
    readonly userFeedSubscriptionsCollectionService: UserFeedSubscriptionsCollectionService;
  }) {
    this.userId = args.userId;
    this.functions = args.functions;
    this.userFeedSubscriptionsCollectionService = args.userFeedSubscriptionsCollectionService;
  }

  /**
   * Subscribes the user to the URL, creating a new feed source if necessary.
   *
   * This is done via Firebase Functions since managing feed sources is a privileged operation.
   */
  public async subscribeToUrl(url: string): AsyncResult<UserFeedSubscriptionId> {
    const callSubscribeUserToFeed: CallSubscribeUserToFeedFn = httpsCallable(
      this.functions,
      'subscribeUserToFeedOnCall'
    );

    // Hit Firebase Functions endpoint to subscribe user to feed source.
    const subscribeResponseResult = await asyncTry(async () => callSubscribeUserToFeed({url}));
    if (!subscribeResponseResult.success) return subscribeResponseResult;
    const subscribeResponse = subscribeResponseResult.value;

    // TODO: Parse and validate the response from the function.

    // Parse the response to get the new user feed subscription ID.
    const idResult = parseUserFeedSubscriptionId(subscribeResponse.data.userFeedSubscriptionId);
    return prefixResultIfError(idResult, 'New user feed subscription ID did not parse correctly');
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
      where('userId', '==', this.userId),
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
  toFirestoreUserFeedSubscription,
  parseUserFeedSubscription
);

const userFeedSubscriptionsCollectionService = new ClientFirestoreCollectionService({
  collectionPath: USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
  converter: userFeedSubscriptionFirestoreConverter,
  parseId: parseUserFeedSubscriptionId,
});

export function useUserFeedSubscriptionsService(): ClientUserFeedSubscriptionsService {
  const loggedInUser = useLoggedInUser();

  const userFeedSubscriptionsService = useMemo(() => {
    return new ClientUserFeedSubscriptionsService({
      userId: loggedInUser.userId,
      functions: firebaseService.functions,
      userFeedSubscriptionsCollectionService,
    });
  }, [loggedInUser]);

  return userFeedSubscriptionsService;
}
