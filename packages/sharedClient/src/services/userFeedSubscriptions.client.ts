import {limit, orderBy, where} from 'firebase/firestore';
import type {Functions, HttpsCallable} from 'firebase/functions';
import {httpsCallable} from 'firebase/functions';
import {useEffect, useMemo} from 'react';

import {USER_FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeYouTubeFeedSource} from '@shared/lib/feedSources.shared';
import {withFirestoreTimestamps} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {getYouTubeChannelId} from '@shared/lib/youtube.shared';

import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
  toStorageUserFeedSubscription,
} from '@shared/parsers/userFeedSubscriptions.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {AsyncState} from '@shared/types/asyncState.types';
import type {FeedSource} from '@shared/types/feedSources.types';
import type {AsyncResult} from '@shared/types/results.types';
import {
  makeUserFeedSubscription,
  type UserFeedSubscription,
  type UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';

import {clientTimestampSupplier, firebaseService} from '@sharedClient/services/firebase.client';
import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
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
   * Subscribes the account to the URL. A new feed source is created if one does not already exist.
   *
   * This is done via Firebase Functions since a privileged server is needed to contact the RSS feed
   * provider (e.g. Superfeedr), which is responsible for managing RSS feed subscriptions.
   */
  public async subscribeToRssFeed(url: URL): AsyncResult<UserFeedSubscriptionId> {
    const callSubscribeAccountToFeed: CallSubscribeUserToFeedFn = httpsCallable(
      this.functions,
      'subscribeAccountToFeedOnCall'
    );

    // Hit Firebase Functions endpoint to subscribe account to feed source.
    const subscribeResponseResult = await asyncTry(async () =>
      callSubscribeAccountToFeed({url: url.href})
    );
    if (!subscribeResponseResult.success) return subscribeResponseResult;
    const subscribeResponse = subscribeResponseResult.value;

    // TODO: Parse and validate the response from the function.

    // Parse the response to get the new user feed subscription ID.
    const idResult = parseUserFeedSubscriptionId(subscribeResponse.data.userFeedSubscriptionId);
    return prefixResultIfError(idResult, 'New user feed subscription ID did not parse correctly');
  }

  /**
   * Subscribes the account to the YouTube channel. A new feed source is created if one does not
   * already exist.
   */
  public async subscribeToYouTubeChannel(url: string): AsyncResult<UserFeedSubscription> {
    const channelIdResult = getYouTubeChannelId(url);

    // TODO: Also support channel handles.
    // const channelHandleResult = getYouTubeChannelHandle(url);

    if (!channelIdResult.success) {
      return prefixErrorResult(channelIdResult, 'Failed to parse YouTube channel URL');
    }

    const channelId = channelIdResult.value;
    if (!channelId) {
      return makeErrorResult(new Error('URL is not a valid YouTube channel URL'));
    }

    const feedSource = makeYouTubeFeedSource({
      // TODO: Switch to `channelId`.
      url: `https://www.youtube.com/channel/${channelId}`,
      // TODO: Address title.
      title: 'YouTube Channel',
    });

    return await this.createSubscription({
      feedSource,
      accountId: this.accountId,
    });
  }

  /**
   * Adds a new user feed subscription document to Firestore.
   */
  public async createSubscription(args: {
    feedSource: FeedSource;
    accountId: AccountId;
  }): AsyncResult<UserFeedSubscription> {
    const {feedSource, accountId} = args;

    // Check if a feed subscription already exists for this feed source.
    const existingSubscriptionsResult =
      await this.userFeedSubscriptionsCollectionService.fetchFirstQueryDoc([
        where('accountId', '==', accountId),
        where('feedSourceId', '==', feedSource.feedSourceId),
      ]);
    if (!existingSubscriptionsResult.success) return existingSubscriptionsResult;

    const existingSubscription = existingSubscriptionsResult.value;
    if (existingSubscription) {
      return makeErrorResult(new Error('Feed subscription already exists'));
    }

    // Make a new user feed subscription object locally.
    const userFeedSubscriptionResult = makeUserFeedSubscription({feedSource, accountId});
    if (!userFeedSubscriptionResult.success) return userFeedSubscriptionResult;
    const newUserFeedSubscription = userFeedSubscriptionResult.value;

    // Add the new user feed subscription to Firestore.
    const userFeedSubscriptionId = newUserFeedSubscription.userFeedSubscriptionId;
    const createResult = await this.userFeedSubscriptionsCollectionService.setDoc(
      userFeedSubscriptionId,
      withFirestoreTimestamps(newUserFeedSubscription, clientTimestampSupplier)
    );
    if (!createResult.success) {
      return prefixErrorResult(createResult, 'Error creating user feed subscription in Firestore');
    }
    return makeSuccessResult(newUserFeedSubscription);
  }

  /**
   * Updates a user feed subscription document in Firestore.
   */
  public async updateSubscription(
    userFeedSubscriptionId: UserFeedSubscriptionId,
    update: Partial<
      Pick<UserFeedSubscription, 'isActive' | 'unsubscribedTime' | 'deliverySchedule'>
    >
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

export const useUserFeedSubscriptions = (): AsyncState<UserFeedSubscription[]> => {
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const {asyncState, setPending, setError, setSuccess} = useAsyncState<UserFeedSubscription[]>();

  useEffect(() => {
    setPending();
    const unsubscribe = userFeedSubscriptionsService.watchAllSubscriptions({
      successCallback: setSuccess,
      errorCallback: setError,
    });

    return () => unsubscribe();
  }, [userFeedSubscriptionsService, setPending, setError, setSuccess]);

  return asyncState;
};
