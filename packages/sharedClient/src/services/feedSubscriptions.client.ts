import {
  limit as firestoreLimit,
  orderBy as firestoreOrderBy,
  where as firestoreWhere,
} from 'firebase/firestore';
import type {HttpsCallable} from 'firebase/functions';
import {httpsCallable} from 'firebase/functions';

import {logger} from '@shared/services/logger.shared';

import {arrayFilterNull, arrayToRecord} from '@shared/lib/arrayUtils.shared';
import {DEFAULT_FEED_TITLE, FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {
  makeIntervalFeedSubscription,
  makeRssFeedSubscription,
  makeYouTubeChannelFeedSubscription,
} from '@shared/lib/feedSubscriptions.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {isPositiveInteger} from '@shared/lib/utils.shared';
import {getYouTubeChannelId} from '@shared/lib/youtube.shared';

import {
  parseFeedSubscription,
  parseFeedSubscriptionId,
} from '@shared/parsers/feedSubscriptions.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {
  FeedSubscription,
  FeedSubscriptionId,
  IntervalFeedSubscription,
  RssFeedSubscription,
  YouTubeChannelFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import {FeedType} from '@shared/types/feedTypes.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';
import type {YouTubeChannelId} from '@shared/types/youtube.types';

import type {FeedSubscriptionFromStorage} from '@shared/schemas/feedSubscriptions.schema';
import {toStorageFeedSubscription} from '@shared/storage/feedSubscriptions.storage';

import type {ClientEventLogService} from '@sharedClient/services/eventLog.client';
import type {ClientFirebaseService} from '@sharedClient/services/firebase.client';
import {makeClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';
import type {ClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';

import {toast} from '@sharedClient/lib/toasts.client';

interface SubscribeToRssFeedRequest {
  readonly url: string;
}

type CallSubscribeToRssFeedFn = HttpsCallable<SubscribeToRssFeedRequest, void>;

type FeedSubscriptionsCollectionService = ClientFirestoreCollectionService<
  FeedSubscriptionId,
  FeedSubscription,
  FeedSubscriptionFromStorage
>;

export class ClientFeedSubscriptionsService {
  private readonly accountId: AccountId;
  private readonly firebaseService: ClientFirebaseService;
  private readonly eventLogService: ClientEventLogService;
  private readonly collectionService: FeedSubscriptionsCollectionService;

  constructor(args: {
    readonly accountId: AccountId;
    readonly firebaseService: ClientFirebaseService;
    readonly eventLogService: ClientEventLogService;
  }) {
    this.accountId = args.accountId;
    this.firebaseService = args.firebaseService;
    this.eventLogService = args.eventLogService;

    this.collectionService = makeClientFirestoreCollectionService({
      firebaseService: args.firebaseService,
      collectionPath: FEED_SUBSCRIPTIONS_DB_COLLECTION,
      toStorage: toStorageFeedSubscription,
      fromStorage: parseFeedSubscription,
      parseId: parseFeedSubscriptionId,
    });
  }

  /**
   * Subscribes the account to the URL. A new feed source is created if one does not already exist.
   *
   * This is done via Firebase Functions since a privileged server is needed to contact the RSS feed
   * provider (e.g. Superfeedr), which is responsible for managing RSS feed subscriptions.
   */
  public async subscribeToRssFeed(url: URL): AsyncResult<RssFeedSubscription, Error> {
    // Check if the account is already subscribed to this RSS feed.
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

    // Create a new feed subscription object locally.
    const feedSubscription = makeRssFeedSubscription({
      url: url.href,
      // TODO: Add better titles.
      title: DEFAULT_FEED_TITLE,
      accountId: this.accountId,
    });

    // Save the new feed subscription.
    return this.saveSubscription<RssFeedSubscription>({
      feedSubscription,
      toastMessage: 'Subscribed to RSS feed',
    });
  }

  /**
   * Subscribes the account to the YouTube channel. A new feed source is created if one does not
   * already exist.
   */
  public async subscribeToYouTubeChannel(
    maybeYouTubeUrl: string
  ): AsyncResult<YouTubeChannelFeedSubscription, Error> {
    // Parse the channel ID from the URL.
    // TODO: Also support channel handles.
    const channelIdResult = getYouTubeChannelId(maybeYouTubeUrl);
    if (!channelIdResult.success) return channelIdResult;
    const channelId = channelIdResult.value;
    if (channelId === null) return makeErrorResult(new Error('Channel ID not found in URL'));

    // Check if the account is already subscribed to this YouTube channel.
    const existingSubResult = await this.fetchExistingYouTubeChannelSubscription(channelId);
    if (!existingSubResult.success) return existingSubResult;

    // TODO: Handle this error more gracefully. Do not consider it full failure.
    const existingSubscription = existingSubResult.value;
    if (existingSubscription) return makeErrorResult(new Error('Already subscribed to channel'));

    // Create a new feed subscription object locally.
    const feedSubscription = makeYouTubeChannelFeedSubscription({
      channelId,
      accountId: this.accountId,
    });

    // Save the new feed subscription.
    return this.saveSubscription<YouTubeChannelFeedSubscription>({
      feedSubscription,
      toastMessage: 'Subscribed to YouTube channel',
    });
  }

  private async fetchExistingRssFeedSubscription(
    url: URL
  ): AsyncResult<RssFeedSubscription | null, Error> {
    const result = await this.collectionService.fetchFirstQueryDoc([
      firestoreWhere('accountId', '==', this.accountId),
      firestoreWhere('feedType', '==', FeedType.RSS),
      firestoreWhere('url', '==', url.href),
    ]);
    if (!result.success) return result;
    const existingSubscription = result.value;
    if (!existingSubscription) return makeSuccessResult(null);
    return makeSuccessResult(existingSubscription as RssFeedSubscription);
  }

  private async fetchExistingYouTubeChannelSubscription(
    channelId: YouTubeChannelId
  ): AsyncResult<YouTubeChannelFeedSubscription | null, Error> {
    const result = await this.collectionService.fetchFirstQueryDoc([
      firestoreWhere('accountId', '==', this.accountId),
      firestoreWhere('feedType', '==', FeedType.YouTubeChannel),
      firestoreWhere('channelId', '==', channelId),
    ]);
    if (!result.success) return result;
    const existingSubscription = result.value;
    if (!existingSubscription) return makeSuccessResult(null);
    return makeSuccessResult(existingSubscription as YouTubeChannelFeedSubscription);
  }

  public async subscribeToIntervalFeed(args: {
    intervalSeconds: number;
  }): AsyncResult<IntervalFeedSubscription, Error> {
    const {intervalSeconds} = args;

    if (!isPositiveInteger(intervalSeconds)) {
      return makeErrorResult(new Error('Interval must be a positive integer'));
    }

    const feedSubscription = makeIntervalFeedSubscription({
      intervalSeconds,
      accountId: this.accountId,
    });

    return this.saveSubscription<IntervalFeedSubscription>({
      feedSubscription,
      toastMessage: 'Subscribed to interval feed',
    });
  }

  /**
   * Saves a feed subscription to Firestore. Also handles event logging and toasts.
   */
  private async saveSubscription<T extends FeedSubscription>(args: {
    readonly feedSubscription: T;
    readonly toastMessage: string;
  }): AsyncResult<T, Error> {
    const {feedSubscription, toastMessage} = args;
    const {accountId, feedType, feedSubscriptionId} = feedSubscription;

    // Save to Firestore.
    const saveResult = await this.collectionService.setDoc(feedSubscriptionId, feedSubscription);
    if (!saveResult.success) {
      const betterError = prefixErrorResult(saveResult, 'Error saving feed subscription');
      logger.error(betterError.error, {feedSubscriptionId, accountId, feedType});
      return betterError;
    }

    // Toast.
    toast(toastMessage);

    // Log.
    void this.eventLogService.logSubscribedToFeedEvent({
      feedType,
      feedSubscriptionId,
      isNewSubscription: true,
    });

    return makeSuccessResult(feedSubscription);
  }

  /**
   * Updates a feed subscription document in Firestore.
   */
  public async updateSubscription(
    feedSubscriptionId: FeedSubscriptionId,
    update: Partial<Pick<FeedSubscription, 'lifecycleState' | 'deliverySchedule'>>
  ): AsyncResult<void, Error> {
    const updateResult = await this.collectionService.updateDoc(feedSubscriptionId, update);
    return prefixResultIfError(updateResult, 'Error updating feed subscription');
  }

  /**
   * Watches updates for an individual feed subscription.
   */
  public watchSubscription(args: {
    readonly feedSubscriptionId: FeedSubscriptionId;
    readonly onData: Consumer<FeedSubscription | null>;
    readonly onError: Consumer<Error>;
  }): Unsubscribe {
    const {feedSubscriptionId, onData, onError} = args;

    const unsubscribe = this.collectionService.watchDoc(feedSubscriptionId, onData, onError);
    return unsubscribe;
  }

  /**
   * Watches updates for multiple feed subscriptions, up to the limit.
   */
  public watchSubscriptions(args: {
    readonly onData: Consumer<Record<FeedSubscriptionId, FeedSubscription>>;
    readonly onError: Consumer<Error>;
    readonly limit?: number;
  }): Unsubscribe {
    const {onData, onError, limit} = args;

    const queryClauses = arrayFilterNull([
      firestoreWhere('accountId', '==', this.accountId),
      // Default to sorting by last updated time, given it is a decent proxy for most recent.
      firestoreOrderBy('lastUpdatedTime', 'desc'),
      limit ? firestoreLimit(limit) : null,
    ]);

    const itemsQuery = this.collectionService.query(queryClauses);

    const unsubscribe = this.collectionService.watchDocs(
      itemsQuery,
      (subscriptions) => {
        const subscriptionsById = arrayToRecord(subscriptions, (s) => s.feedSubscriptionId);
        onData(subscriptionsById);
      },
      onError
    );

    return unsubscribe;
  }
}
