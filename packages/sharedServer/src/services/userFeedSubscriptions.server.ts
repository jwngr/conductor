import {FieldValue} from 'firebase-admin/firestore';
import type {WithFieldValue} from 'firebase-admin/firestore';

import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {FeedSource, FeedSourceId} from '@shared/types/feedSources.types';
import {makeSuccessResult, type AsyncResult} from '@shared/types/result.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionFromStorage,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import {makeUserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

import {serverTimestampSupplier} from './firebase.server';

type UserFeedSubscriptionsCollectionService = ServerFirestoreCollectionService<
  UserFeedSubscriptionId,
  UserFeedSubscription,
  UserFeedSubscriptionFromStorage
>;

export class ServerUserFeedSubscriptionsService {
  private readonly userFeedSubscriptionsCollectionService: UserFeedSubscriptionsCollectionService;

  constructor(args: {
    readonly userFeedSubscriptionsCollectionService: UserFeedSubscriptionsCollectionService;
  }) {
    this.userFeedSubscriptionsCollectionService = args.userFeedSubscriptionsCollectionService;
  }

  /**
   * Fetches all user feed subscription documents for an individual account from Firestore.
   */
  public async fetchAllForAccount(accountId: AccountId): AsyncResult<UserFeedSubscription[]> {
    const query = this.userFeedSubscriptionsCollectionService
      .getCollectionRef()
      .where('accountId', '==', accountId);
    const queryResult = await this.userFeedSubscriptionsCollectionService.fetchQueryDocs(query);
    return prefixResultIfError(queryResult, 'Error fetching user feed subscriptions for account');
  }

  /**
   * Fetches all user feed subscription documents for an individual feed source from Firestore.
   */
  public async fetchForFeedSource(feedSourceId: FeedSourceId): AsyncResult<UserFeedSubscription[]> {
    const query = this.userFeedSubscriptionsCollectionService
      .getCollectionRef()
      .where('feedSourceId', '==', feedSourceId);
    const queryResult = await this.userFeedSubscriptionsCollectionService.fetchQueryDocs(query);
    return prefixResultIfError(
      queryResult,
      'Error fetching user feed subscriptions for feed source'
    );
  }

  /**
   * Adds a new user feed subscription document to Firestore.
   */
  public async create(args: {
    feedSource: FeedSource;
    accountId: AccountId;
  }): AsyncResult<UserFeedSubscription> {
    const {feedSource, accountId} = args;

    // Make a new user feed subscription object locally.
    const userFeedSubscriptionResult = makeUserFeedSubscription<FieldValue>(
      {feedSource, accountId},
      serverTimestampSupplier
    );
    if (!userFeedSubscriptionResult.success) return userFeedSubscriptionResult;
    const newUserFeedSubscription = userFeedSubscriptionResult.value;

    // Add the new user feed subscription to Firestore.
    const userFeedSubscriptionId = newUserFeedSubscription.userFeedSubscriptionId;
    const createResult = await this.userFeedSubscriptionsCollectionService.setDoc(
      userFeedSubscriptionId,
      newUserFeedSubscription
    );
    if (!createResult.success) {
      return prefixErrorResult(createResult, 'Error creating user feed subscription in Firestore');
    }
    return makeSuccessResult(newUserFeedSubscription);
  }

  /**
   * Deactivates an account's subscription to an individual feed source. New subscription items will
   * no longer be added to the subscribed account. The feed source may still be subscribed to by
   * another account.
   */
  public async deactivateFeedSubscription(
    userFeedSubscriptionId: UserFeedSubscriptionId
  ): AsyncResult<void> {
    return this.update(userFeedSubscriptionId, {
      isActive: false,
      unsubscribedTime: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Updates a user feed subscription document in Firestore.
   */
  public async update(
    userFeedSubscriptionId: UserFeedSubscriptionId,
    update: Partial<WithFieldValue<Pick<UserFeedSubscription, 'isActive' | 'unsubscribedTime'>>>
  ): AsyncResult<void> {
    const updateResult = await this.userFeedSubscriptionsCollectionService.updateDoc(
      userFeedSubscriptionId,
      update
    );
    return prefixResultIfError(updateResult, 'Error updating user feed subscription in Firestore');
  }

  /**
   * Permanently deletes a feed subscription document from Firestore.
   */
  public async delete(userFeedSubscriptionId: UserFeedSubscriptionId): AsyncResult<void> {
    const deleteResult =
      await this.userFeedSubscriptionsCollectionService.deleteDoc(userFeedSubscriptionId);
    return prefixResultIfError(deleteResult, 'Error deleting user feed subscription in Firestore');
  }

  /**
   * Permanently deletes all user feed subscription Firestore documents associated with an account.
   */
  public async deleteAllForAccount(accountId: AccountId): AsyncResult<void> {
    // Fetch the IDs for all of the account's feed subscriptions.
    const query = this.userFeedSubscriptionsCollectionService
      .getCollectionRef()
      .where('accountId', '==', accountId);
    const queryResult = await this.userFeedSubscriptionsCollectionService.fetchQueryIds(query);
    if (!queryResult.success) {
      return prefixErrorResult(
        queryResult,
        'Error fetching user feed subscriptions to delete for account in Firestore'
      );
    }

    // Delete all of the account's feed subscriptions.
    const docIdsToDelete = queryResult.value;
    return await this.userFeedSubscriptionsCollectionService.batchDeleteDocs(docIdsToDelete);
  }
}
