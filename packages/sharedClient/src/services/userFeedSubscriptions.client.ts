import {limit, orderBy, where} from 'firebase/firestore';
import type {Functions, HttpsCallable} from 'firebase/functions';
import {httpsCallable} from 'firebase/functions';
import {useEffect, useMemo} from 'react';

import {
  DEFAULT_FEED_TITLE,
  USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
} from '@shared/lib/constants.shared';
import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {withFirestoreTimestamps} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {
  makeIntervalUserFeedSubscription,
  makeRssUserFeedSubscription,
  makeYouTubeChannelUserFeedSubscription,
} from '@shared/lib/userFeedSubscriptions.shared';
import {isPositiveInteger} from '@shared/lib/utils.shared';
import {getYouTubeChannelId} from '@shared/lib/youtube.shared';

import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
  toStorageUserFeedSubscription,
} from '@shared/parsers/userFeedSubscriptions.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {AsyncState} from '@shared/types/asyncState.types';
import {FeedSourceType} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {
  IntervalUserFeedSubscription,
  UserFeedSubscription,
  UserFeedSubscriptionId,
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

type CallSubscribeUserToFeedFn = HttpsCallable<SubscribeToFeedRequest, void>;

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
  public async subscribeToRssFeed(url: URL): AsyncResult<UserFeedSubscription> {
    const callSubscribeAccountToFeed: CallSubscribeUserToFeedFn = httpsCallable(
      this.functions,
      'subscribeAccountToRssFeedOnCall'
    );

    // Hit Firebase Functions endpoint to subscribe account to feed source.
    const subscribeResponseResult = await asyncTry(async () =>
      callSubscribeAccountToFeed({url: url.href})
    );
    if (!subscribeResponseResult.success) return subscribeResponseResult;

    // Create a new user feed subscription object locally.
    const userFeedSubscription = makeRssUserFeedSubscription({
      url: url.href,
      // TODO: Add better titles.
      title: DEFAULT_FEED_TITLE,
      accountId: this.accountId,
    });

    // Save the new user feed subscription to Firestore.
    const docId = userFeedSubscription.userFeedSubscriptionId;
    const docData = withFirestoreTimestamps(userFeedSubscription, clientTimestampSupplier);
    const saveResult = await this.userFeedSubscriptionsCollectionService.setDoc(docId, docData);
    if (!saveResult.success) return prefixErrorResult(saveResult, 'Error saving feed subscription');

    return makeSuccessResult(userFeedSubscription);
  }

  /**
   * Subscribes the account to the YouTube channel. A new feed source is created if one does not
   * already exist.
   */
  public async subscribeToYouTubeChannel(
    maybeYouTubeUrl: string
  ): AsyncResult<UserFeedSubscription> {
    // Parse the channel ID from the URL.
    // TODO: Also support channel handles.
    const channelIdResult = getYouTubeChannelId(maybeYouTubeUrl);
    if (!channelIdResult.success) return channelIdResult;
    const channelId = channelIdResult.value;
    if (channelId === null) return makeErrorResult(new Error('Channel ID not found in URL'));

    // Check if the user is already subscribed to this YouTube channel.
    const existingSubResult = await this.userFeedSubscriptionsCollectionService.fetchFirstQueryDoc([
      where('accountId', '==', this.accountId),
      // TODO: Confirm this works. May need an index.
      where('type', '==', FeedSourceType.YouTubeChannel),
      where('channelId', '==', channelId),
    ]);
    if (!existingSubResult.success) return existingSubResult;

    // TODO: Handle this error more gracefully. Do not consider it full failure.
    const existingSubscription = existingSubResult.value;
    if (existingSubscription) return makeErrorResult(new Error('Feed subscription already exists'));

    // TODO: Fetch current feed source and use it below.

    // Create a new user feed subscription object locally.
    const userFeedSubscription = makeYouTubeChannelUserFeedSubscription({
      channelId,
      accountId: this.accountId,
    });

    // Save the new user feed subscription to Firestore.
    const docId = userFeedSubscription.userFeedSubscriptionId;
    const docData = withFirestoreTimestamps(userFeedSubscription, clientTimestampSupplier);
    const saveResult = await this.userFeedSubscriptionsCollectionService.setDoc(docId, docData);
    if (!saveResult.success) return prefixErrorResult(saveResult, 'Error saving feed subscription');

    return makeSuccessResult(userFeedSubscription);
  }

  public async subscribeToIntervalFeed(args: {
    intervalSeconds: number;
  }): AsyncResult<IntervalUserFeedSubscription> {
    const {intervalSeconds} = args;

    if (!isPositiveInteger(intervalSeconds)) {
      return makeErrorResult(new Error('Interval must be a positive integer'));
    }

    // Create a new user feed subscription object locally.
    const userFeedSubscription = makeIntervalUserFeedSubscription({
      intervalSeconds,
      accountId: this.accountId,
    });

    // Save the new user feed subscription to Firestore.
    const docId = userFeedSubscription.userFeedSubscriptionId;
    const docData = withFirestoreTimestamps(userFeedSubscription, clientTimestampSupplier);
    const saveResult = await this.userFeedSubscriptionsCollectionService.setDoc(docId, docData);
    if (!saveResult.success) return prefixErrorResult(saveResult, 'Error saving feed subscription');

    return makeSuccessResult(userFeedSubscription);
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
