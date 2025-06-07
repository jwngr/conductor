import {limit, orderBy, where} from 'firebase/firestore';
import type {HttpsCallable} from 'firebase/functions';
import {httpsCallable} from 'firebase/functions';

import {logger} from '@shared/services/logger.shared';

import {
  DEFAULT_FEED_TITLE,
  USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
} from '@shared/lib/constants.shared';
import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
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
} from '@shared/parsers/userFeedSubscriptions.parser';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  UserFeedSubscription,
  UserFeedSubscriptionId,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';
import type {YouTubeChannelId} from '@shared/types/youtube.types';

import {toStorageUserFeedSubscription} from '@shared/storage/userFeedSubscriptions.storage';

import type {ClientEventLogService} from '@sharedClient/services/eventLog.client';
import type {ClientFirebaseService} from '@sharedClient/services/firebase.client';
import {makeClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';

import {toast} from '@sharedClient/lib/toasts.client';

interface SubscribeToRssFeedRequest {
  readonly url: string;
}

type CallSubscribeToRssFeedFn = HttpsCallable<SubscribeToRssFeedRequest, void>;

const clientUserFeedSubscriptionsCollectionService = makeClientFirestoreCollectionService({
  collectionPath: USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
  toStorage: toStorageUserFeedSubscription,
  fromStorage: parseUserFeedSubscription,
  parseId: parseUserFeedSubscriptionId,
});

export class ClientUserFeedSubscriptionsService {
  private readonly accountId: AccountId;
  private readonly firebaseService: ClientFirebaseService;
  private readonly eventLogService: ClientEventLogService;

  constructor(args: {
    readonly accountId: AccountId;
    readonly firebaseService: ClientFirebaseService;
    readonly eventLogService: ClientEventLogService;
  }) {
    this.accountId = args.accountId;
    this.firebaseService = args.firebaseService;
    this.eventLogService = args.eventLogService;
  }

  /**
   * Subscribes the account to the URL. A new feed source is created if one does not already exist.
   *
   * This is done via Firebase Functions since a privileged server is needed to contact the RSS feed
   * provider (e.g. Superfeedr), which is responsible for managing RSS feed subscriptions.
   */
  public async subscribeToRssFeed(url: URL): AsyncResult<RssUserFeedSubscription, Error> {
    // Check if the user is already subscribed to this RSS feed.
    const existingSubResult = await this.fetchExistingRssFeedSubscription(url);
    if (!existingSubResult.success) return existingSubResult;

    // TODO: Handle this error more gracefully. Do not consider it full failure.
    const existingSubscription = existingSubResult.value;
    if (existingSubscription) return makeErrorResult(new Error('Already subscribed to RSS feed'));

    // TODO: Add typesafe method on `ClientFirebaseService` for this.
    const callSubscribeToRssFeed: CallSubscribeToRssFeedFn = httpsCallable(
      this.firebaseService.functions,
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

    // Save the new user feed subscription.
    return this.saveSubscription<RssUserFeedSubscription>({
      userFeedSubscription,
      toastMessage: 'Subscribed to RSS feed',
    });
  }

  /**
   * Subscribes the account to the YouTube channel. A new feed source is created if one does not
   * already exist.
   */
  public async subscribeToYouTubeChannel(
    maybeYouTubeUrl: string
  ): AsyncResult<YouTubeChannelUserFeedSubscription, Error> {
    // Parse the channel ID from the URL.
    // TODO: Also support channel handles.
    const channelIdResult = getYouTubeChannelId(maybeYouTubeUrl);
    if (!channelIdResult.success) return channelIdResult;
    const channelId = channelIdResult.value;
    if (channelId === null) return makeErrorResult(new Error('Channel ID not found in URL'));

    // Check if the user is already subscribed to this YouTube channel.
    const existingSubResult = await this.fetchExistingYouTubeChannelSubscription(channelId);
    if (!existingSubResult.success) return existingSubResult;

    // TODO: Handle this error more gracefully. Do not consider it full failure.
    const existingSubscription = existingSubResult.value;
    if (existingSubscription) return makeErrorResult(new Error('Already subscribed to channel'));

    // Create a new user feed subscription object locally.
    const userFeedSubscription = makeYouTubeChannelUserFeedSubscription({
      channelId,
      accountId: this.accountId,
    });

    // Save the new user feed subscription.
    return this.saveSubscription<YouTubeChannelUserFeedSubscription>({
      userFeedSubscription,
      toastMessage: 'Subscribed to YouTube channel',
    });
  }

  private async fetchExistingRssFeedSubscription(
    url: URL
  ): AsyncResult<RssUserFeedSubscription | null, Error> {
    const result = await clientUserFeedSubscriptionsCollectionService.fetchFirstQueryDoc([
      where('accountId', '==', this.accountId),
      where('feedSourceType', '==', FeedSourceType.RSS),
      where('url', '==', url.href),
    ]);
    if (!result.success) return result;
    const existingSubscription = result.value;
    if (!existingSubscription) return makeSuccessResult(null);
    return makeSuccessResult(existingSubscription as RssUserFeedSubscription);
  }

  private async fetchExistingYouTubeChannelSubscription(
    channelId: YouTubeChannelId
  ): AsyncResult<YouTubeChannelUserFeedSubscription | null, Error> {
    const result = await clientUserFeedSubscriptionsCollectionService.fetchFirstQueryDoc([
      where('accountId', '==', this.accountId),
      where('feedSourceType', '==', FeedSourceType.YouTubeChannel),
      where('channelId', '==', channelId),
    ]);
    if (!result.success) return result;
    const existingSubscription = result.value;
    if (!existingSubscription) return makeSuccessResult(null);
    return makeSuccessResult(existingSubscription as YouTubeChannelUserFeedSubscription);
  }

  public async subscribeToIntervalFeed(args: {
    intervalSeconds: number;
  }): AsyncResult<IntervalUserFeedSubscription, Error> {
    const {intervalSeconds} = args;

    if (!isPositiveInteger(intervalSeconds)) {
      return makeErrorResult(new Error('Interval must be a positive integer'));
    }

    const userFeedSubscription = makeIntervalUserFeedSubscription({
      intervalSeconds,
      accountId: this.accountId,
    });

    return this.saveSubscription<IntervalUserFeedSubscription>({
      userFeedSubscription,
      toastMessage: 'Subscribed to interval feed',
    });
  }

  /**
   * Saves a user feed subscription to Firestore. Also handles event logging and toasts.
   */
  private async saveSubscription<T extends UserFeedSubscription>(args: {
    readonly userFeedSubscription: T;
    readonly toastMessage: string;
  }): AsyncResult<T, Error> {
    const {userFeedSubscription, toastMessage} = args;
    const {accountId, feedSourceType, userFeedSubscriptionId} = userFeedSubscription;

    // Save to Firestore.
    const saveResult = await clientUserFeedSubscriptionsCollectionService.setDoc(
      userFeedSubscriptionId,
      userFeedSubscription
    );
    if (!saveResult.success) {
      const betterError = prefixErrorResult(saveResult, 'Error saving feed subscription');
      logger.error(betterError.error, {userFeedSubscriptionId, accountId, feedSourceType});
      return betterError;
    }

    // Toast.
    toast(toastMessage);

    // Log.
    void this.eventLogService.logSubscribedToFeedSourceEvent({
      feedSourceType,
      userFeedSubscriptionId,
      isNewSubscription: true,
    });

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
  ): AsyncResult<void, Error> {
    const updateResult = await clientUserFeedSubscriptionsCollectionService.updateDoc(
      userFeedSubscriptionId,
      update
    );
    return prefixResultIfError(updateResult, 'Error updating user feed subscription');
  }

  /**
   * Watches updates for an individual user feed subscription.
   */
  public watchSubscription(args: {
    readonly userFeedSubscriptionId: UserFeedSubscriptionId;
    readonly successCallback: Consumer<UserFeedSubscription | null>;
    readonly errorCallback: Consumer<Error>;
  }): Unsubscribe {
    const {userFeedSubscriptionId, successCallback, errorCallback} = args;

    const unsubscribe = clientUserFeedSubscriptionsCollectionService.watchDoc(
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

    const itemsQuery = clientUserFeedSubscriptionsCollectionService.query([
      where('accountId', '==', this.accountId),
      orderBy('createdTime', 'desc'),
      limit(100),
    ]);

    const unsubscribe = clientUserFeedSubscriptionsCollectionService.watchDocs(
      itemsQuery,
      successCallback,
      errorCallback
    );
    return () => unsubscribe();
  }
}
