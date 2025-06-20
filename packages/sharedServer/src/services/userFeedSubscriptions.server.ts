import type {WithFieldValue} from 'firebase-admin/firestore';

import {USER_FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
} from '@shared/parsers/userFeedSubscriptions.parser';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedType} from '@shared/types/feedSourceTypes.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

import type {UserFeedSubscriptionFromStorage} from '@shared/schemas/userFeedSubscriptions.schema';
import {toStorageUserFeedSubscription} from '@shared/storage/userFeedSubscriptions.storage';

import {serverTimestampSupplier} from '@sharedServer/services/firebase.server';
import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';
import {
  makeServerFirestoreCollectionService,
  type ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';

type UserFeedSubscriptionsCollectionService = ServerFirestoreCollectionService<
  UserFeedSubscriptionId,
  UserFeedSubscription,
  UserFeedSubscriptionFromStorage
>;

export class ServerUserFeedSubscriptionsService {
  private readonly collectionService: UserFeedSubscriptionsCollectionService;

  constructor(args: {readonly firebaseService: ServerFirebaseService}) {
    this.collectionService = makeServerFirestoreCollectionService({
      firebaseService: args.firebaseService,
      collectionPath: USER_FEED_SUBSCRIPTIONS_DB_COLLECTION,
      parseId: parseUserFeedSubscriptionId,
      toStorage: toStorageUserFeedSubscription,
      fromStorage: parseUserFeedSubscription,
    });
  }

  /**
   * Fetches all user feed subscription documents for an individual account from Firestore.
   */
  public async fetchAllForAccount(
    accountId: AccountId
  ): AsyncResult<UserFeedSubscription[], Error> {
    const query = this.collectionService.getCollectionRef().where('accountId', '==', accountId);
    const queryResult = await this.collectionService.fetchQueryDocs(query);
    return prefixResultIfError(queryResult, 'Error fetching feed subscriptions for account');
  }

  /**
   * Fetches all user feed subscription documents for an individual account from Firestore.
   */
  public async fetchActiveIntervalSubscriptions(): AsyncResult<
    IntervalUserFeedSubscription[],
    Error
  > {
    const query = this.collectionService
      .getCollectionRef()
      .where('feedType', '==', FeedType.Interval)
      .where('isActive', '==', true);
    const queryResult = await this.collectionService.fetchQueryDocs(query);
    if (!queryResult.success) return queryResult;
    return makeSuccessResult(queryResult.value as IntervalUserFeedSubscription[]);
  }

  public async fetchForRssFeedSourceByUrl(
    url: string
  ): AsyncResult<RssUserFeedSubscription[], Error> {
    const query = this.collectionService
      .getCollectionRef()
      .where('feedType', '==', FeedType.RSS)
      .where('url', '==', url);

    const queryResult = await this.collectionService.fetchQueryDocs(query);
    if (!queryResult.success) {
      const message = 'Error fetching user feed subscriptions for RSS feed source';
      return prefixErrorResult(queryResult, message);
    }

    return makeSuccessResult(queryResult.value as RssUserFeedSubscription[]);
  }

  /**
   * Deactivates an account's subscription to an individual feed source. New subscription items will
   * no longer be added to the subscribed account. The feed source may still be subscribed to by
   * another account.
   */
  public async deactivateFeedSubscription(
    userFeedSubscriptionId: UserFeedSubscriptionId
  ): AsyncResult<void, Error> {
    return this.update(userFeedSubscriptionId, {
      isActive: false,
      unsubscribedTime: serverTimestampSupplier(),
    });
  }

  /**
   * Updates a user feed subscription document in Firestore.
   */
  public async update(
    userFeedSubscriptionId: UserFeedSubscriptionId,
    update: Partial<WithFieldValue<Pick<UserFeedSubscription, 'isActive' | 'unsubscribedTime'>>>
  ): AsyncResult<void, Error> {
    const updateResult = await this.collectionService.updateDoc(userFeedSubscriptionId, update);
    return prefixResultIfError(updateResult, 'Error updating user feed subscription in Firestore');
  }

  /**
   * Permanently deletes a feed subscription document from Firestore.
   */
  public async delete(userFeedSubscriptionId: UserFeedSubscriptionId): AsyncResult<void, Error> {
    const deleteResult = await this.collectionService.deleteDoc(userFeedSubscriptionId);
    return prefixResultIfError(deleteResult, 'Error deleting user feed subscription in Firestore');
  }

  /**
   * Permanently deletes all user feed subscription Firestore documents associated with an account.
   */
  public async deleteAllForAccount(accountId: AccountId): AsyncResult<void, Error> {
    // Fetch the IDs for all of the account's feed subscriptions.
    const query = this.collectionService.getCollectionRef().where('accountId', '==', accountId);
    const queryResult = await this.collectionService.fetchQueryIds(query);
    if (!queryResult.success) {
      return prefixErrorResult(
        queryResult,
        'Error fetching user feed subscriptions to delete for account in Firestore'
      );
    }

    // Delete all of the account's feed subscriptions.
    const docIdsToDelete = queryResult.value;
    return await this.collectionService.batchDeleteDocs(docIdsToDelete);
  }

  /**
   * Creates a new user feed subscription in Firestore.
   */
  public async createSubscription(
    userFeedSubscription: UserFeedSubscription
  ): AsyncResult<void, Error> {
    const createResult = await this.collectionService.setDoc(
      userFeedSubscription.userFeedSubscriptionId,
      userFeedSubscription
    );
    return prefixResultIfError(createResult, 'Error creating user feed subscription in Firestore');
  }
}
