import type {CollectionReference} from 'firebase/firestore';
import {collection, doc, limit, onSnapshot, orderBy, query, where} from 'firebase/firestore';
import type {Functions, HttpsCallableResult} from 'firebase/functions';
import {httpsCallable} from 'firebase/functions';
import {useMemo} from 'react';

import {USER_FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {asyncTry} from '@shared/lib/errorUtils.shared';

import type {AsyncResult} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import {makeUserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import type {AsyncFunc, Consumer, Unsubscribe} from '@shared/types/utils.types';

import {firebaseService} from '@sharedClient/services/firebase.client';

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

export class ClientUserFeedSubscriptionsService {
  private userId: UserId;
  private functions: Functions;
  private userFeedSubscriptionsDbRef: CollectionReference;

  constructor(args: {
    readonly userId: UserId;
    readonly functions: Functions;
    readonly userFeedSubscriptionsDbRef: CollectionReference;
  }) {
    this.userId = args.userId;
    this.functions = args.functions;
    this.userFeedSubscriptionsDbRef = args.userFeedSubscriptionsDbRef;
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

    console.log('subscribeResponse', subscribeResponse);
    console.log('userFeedSubscriptionId', subscribeResponse.data.userFeedSubscriptionId);

    // TODO: Parse and validate the response from the function.

    // Parse the response to get the new user feed subscription ID.
    const newUserFeedSubscriptionIdResult = makeUserFeedSubscriptionId(
      subscribeResponse.data.userFeedSubscriptionId
    );
    if (!newUserFeedSubscriptionIdResult.success) return newUserFeedSubscriptionIdResult;
    const newUserFeedSubscriptionId = newUserFeedSubscriptionIdResult.value;

    return makeSuccessResult(newUserFeedSubscriptionId);
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
    readonly successCallback: Consumer<UserFeedSubscription>;
    readonly errorCallback: Consumer<Error>;
  }): Unsubscribe {
    const {userFeedSubscriptionId, successCallback, errorCallback} = args;

    const userFeedSubscriptionDoc = doc(this.userFeedSubscriptionsDbRef, userFeedSubscriptionId);

    const unsubscribe = onSnapshot(
      userFeedSubscriptionDoc,
      (snapshot) => {
        const feedItem = snapshot.data() as UserFeedSubscription;
        successCallback(feedItem);
      },
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

    const itemsQuery = query(
      this.userFeedSubscriptionsDbRef,
      where('userId', '==', this.userId),
      orderBy('createdTime', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const feedItems = snapshot.docs.map((doc) => doc.data() as UserFeedSubscription);
        successCallback(feedItems);
      },
      errorCallback
    );
    return () => unsubscribe();
  }
}

const userFeedSubscriptionsDbRef = collection(
  firebaseService.firestore,
  USER_FEED_SUBSCRIPTIONS_DB_COLLECTION
);

export function useUserFeedSubscriptionsService(): ClientUserFeedSubscriptionsService {
  const loggedInUser = useLoggedInUser();

  const userFeedSubscriptionsService = useMemo(() => {
    return new ClientUserFeedSubscriptionsService({
      userId: loggedInUser.userId,
      functions: firebaseService.functions,
      userFeedSubscriptionsDbRef,
    });
  }, [loggedInUser]);

  return userFeedSubscriptionsService;
}
