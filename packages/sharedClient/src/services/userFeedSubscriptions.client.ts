import {limit, orderBy, where} from 'firebase/firestore';
import type {Functions, HttpsCallable} from 'firebase/functions';
import {httpsCallable} from 'firebase/functions';

import {logger} from '@shared/services/logger.shared';

import {DEFAULT_FEED_TITLE} from '@shared/lib/constants.shared';
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

import type {AccountId} from '@shared/types/accounts.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {
  IntervalUserFeedSubscription,
  UserFeedSubscription,
  UserFeedSubscriptionId,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';
import type {Consumer, Supplier, Unsubscribe} from '@shared/types/utils.types';

import type {ClientEventLogService} from '@sharedClient/services/eventLog.client';
import {clientTimestampSupplier} from '@sharedClient/services/firebase.client';
import type {ClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';

import {toast} from '@sharedClient/lib/toasts.client';

interface SubscribeToRssFeedRequest {
  readonly url: string;
}

type CallSubscribeToRssFeedFn = HttpsCallable<SubscribeToRssFeedRequest, void>;

type UserFeedSubscriptionsCollectionService = ClientFirestoreCollectionService<
  UserFeedSubscriptionId,
  UserFeedSubscription
>;

export class ClientUserFeedSubscriptionsService {
  private readonly accountId: AccountId;
  private readonly functions: Functions;
  private readonly eventLogService: ClientEventLogService;
  private readonly userFeedSubscriptionsCollectionService: UserFeedSubscriptionsCollectionService;

  constructor(args: {
    readonly accountId: AccountId;
    readonly functions: Functions;
    readonly eventLogService: ClientEventLogService;
    readonly userFeedSubscriptionsCollectionService: UserFeedSubscriptionsCollectionService;
  }) {
    this.accountId = args.accountId;
    this.functions = args.functions;
    this.eventLogService = args.eventLogService;
    this.userFeedSubscriptionsCollectionService = args.userFeedSubscriptionsCollectionService;
  }

  /**
   * Subscribes the account to the URL. A new feed source is created if one does not already exist.
   *
   * This is done via Firebase Functions since a privileged server is needed to contact the RSS feed
   * provider (e.g. Superfeedr), which is responsible for managing RSS feed subscriptions.
   */
  public async subscribeToRssFeed(url: URL): AsyncResult<UserFeedSubscription> {
    // Check if the user is already subscribed to this RSS feed.
    const existingSubResult = await this.userFeedSubscriptionsCollectionService.fetchFirstQueryDoc([
      where('accountId', '==', this.accountId),
      where('feedSourceType', '==', FeedSourceType.RSS),
      where('url', '==', url.href),
    ]);
    if (!existingSubResult.success) return existingSubResult;

    // TODO: Handle this error more gracefully. Do not consider it full failure.
    const existingSubscription = existingSubResult.value;
    if (existingSubscription) return makeErrorResult(new Error('Already subscribed to RSS feed'));

    const callSubscribeToRssFeed: CallSubscribeToRssFeedFn = httpsCallable(
      this.functions,
      'subscribeToRssFeedOnCall'
    );

    // Hit Firebase Functions endpoint to subscribe to RSS feed.
    const subscribeResponseResult = await asyncTry(async () =>
      callSubscribeToRssFeed({url: url.href})
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
      where('feedSourceType', '==', FeedSourceType.YouTubeChannel),
      where('channelId', '==', channelId),
    ]);
    if (!existingSubResult.success) return existingSubResult;

    // TODO: Handle this error more gracefully. Do not consider it full failure.
    const existingSubscription = existingSubResult.value;
    if (existingSubscription) return makeErrorResult(new Error('Already subscribed to channel'));

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

  public async subscribeToYouTubeChannel2(
    maybeYouTubeUrl: string
  ): AsyncResult<UserFeedSubscription> {
    // Parse the channel ID from the URL.
    // TODO: Also support channel handles.
    const channelIdResult = getYouTubeChannelId(maybeYouTubeUrl);
    if (!channelIdResult.success) return channelIdResult;
    const channelId = channelIdResult.value;
    if (channelId === null) return makeErrorResult(new Error('Channel ID not found in URL'));

    const userFeedSubscription = makeYouTubeChannelUserFeedSubscription({
      channelId,
      accountId: this.accountId,
    });

    const fetchExistingSubscription = async () =>
      await this.userFeedSubscriptionsCollectionService.fetchFirstQueryDoc([
        where('accountId', '==', this.accountId),
        where('feedSourceType', '==', FeedSourceType.YouTubeChannel),
        where('channelId', '==', channelId),
      ]);

    return this.subscribeToFeedSource<YouTubeChannelUserFeedSubscription>({
      newUserFeedSubscription: userFeedSubscription,
      fetchExistingSubscription,
    });
  }

  public async subscribeToIntervalFeed(args: {
    intervalSeconds: number;
  }): AsyncResult<IntervalUserFeedSubscription> {
    const {intervalSeconds} = args;

    if (!isPositiveInteger(intervalSeconds)) {
      return makeErrorResult(new Error('Interval must be a positive integer'));
    }

    const userFeedSubscription = makeIntervalUserFeedSubscription({
      intervalSeconds,
      accountId: this.accountId,
    });

    return this.subscribeToFeedSource<IntervalUserFeedSubscription>({
      newUserFeedSubscription: userFeedSubscription,
      fetchExistingSubscription: async () => makeSuccessResult(null),
    });
  }

  /**
   * Subscribes the account to a feed source. A new feed source is created if one does not already
   * exist.
   */
  private async subscribeToFeedSource<T extends UserFeedSubscription>(args: {
    readonly newUserFeedSubscription: T;
    readonly fetchExistingSubscription: Supplier<AsyncResult<T | null>>;
  }): AsyncResult<T> {
    const {newUserFeedSubscription, fetchExistingSubscription} = args;

    const logDetails = {
      accountId: newUserFeedSubscription.accountId,
      feedSourceType: newUserFeedSubscription.feedSourceType,
    } as const;

    // Check if the user is already subscribed to this feed source.
    const existingSubResult = await fetchExistingSubscription();
    if (!existingSubResult.success) {
      const message = 'Error fetching existing subscription';
      toast.error(message);
      logger.error(existingSubResult.error, logDetails);
      return existingSubResult;
    }

    const existingSubscription = existingSubResult.value;
    if (existingSubscription) {
      const message = 'Already subscribed to feed';
      toast.error(message);
      // TODO: Handle this error more gracefully. Do not consider it full failure.
      return makeErrorResult(new Error(message));
    }

    // TODO: Fetch current feed source and use it below.

    // Create a new user feed subscription object locally.
    // const userFeedSubscription = m  akeYouTubeChannelUserFeedSubscription({
    //   channelId,
    //   accountId: this.accountId,
    // });

    // Save the new user feed subscription to Firestore.
    const docId = newUserFeedSubscription.userFeedSubscriptionId;
    const docData = withFirestoreTimestamps(newUserFeedSubscription, clientTimestampSupplier);
    const saveResult = await this.userFeedSubscriptionsCollectionService.setDoc(docId, docData);
    if (!saveResult.success) {
      toast.error('Error subscribing to feed');
      const betterError = prefixErrorResult(saveResult, 'Error saving feed subscription');
      logger.error(betterError.error, logDetails);
      return betterError;
    }

    toast.success('Subscribed to feed');

    this.eventLogService.logSubscribeToFeedSourceEvent({
      feedSourceType: newUserFeedSubscription.feedSourceType,
      userFeedSubscriptionId: newUserFeedSubscription.userFeedSubscriptionId,
    });

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
