import {
  collection,
  CollectionReference,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import {Functions, httpsCallable, HttpsCallableResult} from 'firebase/functions';
import {useMemo} from 'react';

import {USER_FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants';
import {asyncTry} from '@shared/lib/errors';

import {AsyncResult, makeSuccessResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';
import {
  makeUserFeedSubscriptionId,
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import {AsyncFunc, Consumer, Unsubscribe} from '@shared/types/utils.types';

import {useLoggedInUser} from '@shared/hooks/auth.hooks';

import {firebaseService} from '@src/lib/firebase.pwa';

interface SubscribeToFeedRequest {
  readonly url: string;
}

interface SubscribeToFeedResponse {
  readonly feedSubscriptionId: string;
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
    const {userId, functions, userFeedSubscriptionsDbRef} = args;
    this.userId = userId;
    this.functions = functions;
    this.userFeedSubscriptionsDbRef = userFeedSubscriptionsDbRef;
  }

  /**
   * Subscribes to a feed. If the feed does not already exist in the feeds collection, it will be
   * created.
   */
  public async subscribeToFeedUrl(url: string): AsyncResult<UserFeedSubscriptionId> {
    const callSubscribeUserToFeed: CallSubscribeUserToFeedFn = httpsCallable(
      this.functions,
      'subscribeUserToFeedOnCall'
    );

    // Hit Firebase Functions endpoint to subscribe user to feed.
    const subscribeResponseResult = await asyncTry(
      async () => await callSubscribeUserToFeed({url})
    );
    if (!subscribeResponseResult.success) return subscribeResponseResult;
    const subscribeResponse = subscribeResponseResult.value;

    // Parse the response to get the new user feed subscription ID.
    const newUserFeedSubscriptionIdResult = makeUserFeedSubscriptionId(
      subscribeResponse.data.feedSubscriptionId
    );
    if (!newUserFeedSubscriptionIdResult.success) return newUserFeedSubscriptionIdResult;
    const newUserFeedSubscriptionId = newUserFeedSubscriptionIdResult.value;

    return makeSuccessResult(newUserFeedSubscriptionId);
  }

  public async unsubscribeFromFeedUrl(url: string): AsyncResult<void> {
    console.log('unsubscribeFromFeedUrl', url);
    return makeSuccessResult(undefined);
  }

  /**
   * Watches updates for an individual user feed subscription.
   */
  public watchSubscription(args: {
    readonly feedSubscriptionId: UserFeedSubscriptionId;
    readonly successCallback: Consumer<UserFeedSubscription>;
    readonly errorCallback: Consumer<Error>;
  }): Unsubscribe {
    const {feedSubscriptionId, successCallback, errorCallback} = args;

    const userFeedSubscriptionDoc = doc(this.userFeedSubscriptionsDbRef, feedSubscriptionId);

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
