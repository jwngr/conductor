import type {WithFieldValue} from 'firebase-admin/firestore';

import {FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {
  parseFeedSubscription,
  parseFeedSubscriptionId,
} from '@shared/parsers/feedSubscriptions.parser';

import {FeedType} from '@shared/types/feeds.types';
import type {
  FeedSubscription,
  IntervalFeedSubscription,
  RssFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import {FeedSubscriptionActivityStatus} from '@shared/types/feedSubscriptions.types';
import type {AccountId, FeedSubscriptionId} from '@shared/types/ids.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {FeedSubscriptionFromStorage} from '@shared/schemas/feedSubscriptions.schema';
import {toStorageFeedSubscription} from '@shared/storage/feedSubscriptions.storage';

import {serverTimestampSupplier} from '@sharedServer/services/firebase.server';
import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';
import {
  makeServerFirestoreCollectionService,
  type ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';

type FeedSubscriptionsCollectionService = ServerFirestoreCollectionService<
  FeedSubscriptionId,
  FeedSubscription,
  FeedSubscriptionFromStorage
>;

export class ServerFeedSubscriptionsService {
  private readonly collectionService: FeedSubscriptionsCollectionService;

  constructor(args: {readonly firebaseService: ServerFirebaseService}) {
    this.collectionService = makeServerFirestoreCollectionService({
      firebaseService: args.firebaseService,
      collectionPath: FEED_SUBSCRIPTIONS_DB_COLLECTION,
      parseId: parseFeedSubscriptionId,
      toStorage: toStorageFeedSubscription,
      fromStorage: parseFeedSubscription,
    });
  }

  /**
   * Fetches all feed subscription documents for an individual account from Firestore.
   */
  public async fetchAllForAccount(accountId: AccountId): AsyncResult<FeedSubscription[], Error> {
    const query = this.collectionService.getCollectionRef().where('accountId', '==', accountId);
    const queryResult = await this.collectionService.fetchQueryDocs(query);
    return prefixResultIfError(queryResult, 'Error fetching feed subscriptions for account');
  }

  /**
   * Fetches all active interval feed subscription documents for an individual account from Firestore.
   */
  public async fetchActiveIntervalSubscriptions(): AsyncResult<IntervalFeedSubscription[], Error> {
    const query = this.collectionService
      .getCollectionRef()
      .where('feedType', '==', FeedType.Interval)
      .where('lifecycleState.status', '==', FeedSubscriptionActivityStatus.Active);
    const queryResult = await this.collectionService.fetchQueryDocs(query);
    if (!queryResult.success) return queryResult;
    return makeSuccessResult(queryResult.value as IntervalFeedSubscription[]);
  }

  public async fetchForRssFeedByUrl(url: string): AsyncResult<RssFeedSubscription[], Error> {
    const query = this.collectionService
      .getCollectionRef()
      .where('feedType', '==', FeedType.RSS)
      .where('url', '==', url);

    const queryResult = await this.collectionService.fetchQueryDocs(query);
    if (!queryResult.success) {
      const message = 'Error fetching feed subscriptions for RSS feed source';
      return prefixErrorResult(queryResult, message);
    }

    return makeSuccessResult(queryResult.value as RssFeedSubscription[]);
  }

  /**
   * Deactivates an account's subscription to an individual feed source. New subscription items will
   * no longer be added to the subscribed account. The feed source may still be subscribed to by
   * another account.
   */
  public async deactivateFeedSubscription(
    feedSubscriptionId: FeedSubscriptionId
  ): AsyncResult<void, Error> {
    return this.update(feedSubscriptionId, {
      lifecycleState: {
        status: FeedSubscriptionActivityStatus.Inactive,
        unsubscribedTime: serverTimestampSupplier(),
      },
    });
  }

  /**
   * Updates a feed subscription document in Firestore.
   */
  public async update(
    feedSubscriptionId: FeedSubscriptionId,
    update: Partial<WithFieldValue<Pick<FeedSubscription, 'lifecycleState' | 'deliverySchedule'>>>
  ): AsyncResult<void, Error> {
    const updateResult = await this.collectionService.updateDoc(feedSubscriptionId, update);
    return prefixResultIfError(updateResult, 'Error updating feed subscription in Firestore');
  }

  /**
   * Permanently deletes a feed subscription document from Firestore.
   */
  public async delete(feedSubscriptionId: FeedSubscriptionId): AsyncResult<void, Error> {
    const deleteResult = await this.collectionService.deleteDoc(feedSubscriptionId);
    return prefixResultIfError(deleteResult, 'Error deleting feed subscription in Firestore');
  }

  /**
   * Permanently deletes all feed subscription Firestore documents associated with an account.
   */
  public async deleteAllForAccount(accountId: AccountId): AsyncResult<void, Error> {
    // Fetch the IDs for all of the account's feed subscriptions.
    const query = this.collectionService.getCollectionRef().where('accountId', '==', accountId);
    const queryResult = await this.collectionService.fetchQueryIds(query);
    if (!queryResult.success) {
      return prefixErrorResult(
        queryResult,
        'Error fetching feed subscriptions to delete for account in Firestore'
      );
    }

    // Delete all of the account's feed subscriptions.
    const docIdsToDelete = queryResult.value;
    return await this.collectionService.batchDeleteDocs(docIdsToDelete);
  }

  /**
   * Adds a new feed subscription to Firestore.
   */
  public async addSubscription(feedSubscription: FeedSubscription): AsyncResult<void, Error> {
    const createResult = await this.collectionService.setDoc(
      feedSubscription.feedSubscriptionId,
      feedSubscription
    );
    return prefixResultIfError(createResult, 'Error creating feed subscription in Firestore');
  }
}
