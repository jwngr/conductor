import type {WithFieldValue} from 'firebase-admin/firestore';

import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

import type {UserFeedSubscriptionFromStorage} from '@shared/schemas/userFeedSubscriptions.schema';

import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

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
    return prefixResultIfError(queryResult, 'Error fetching feed subscriptions for account');
  }

  /**
   * Fetches all user feed subscription documents for an individual account from Firestore.
   */
  public async fetchActiveIntervalSubscriptions(): AsyncResult<IntervalUserFeedSubscription[]> {
    const query = this.userFeedSubscriptionsCollectionService
      .getCollectionRef()
      .where('feedSourceType', '==', FeedSourceType.Interval)
      .where('isActive', '==', true);
    const queryResult = await this.userFeedSubscriptionsCollectionService.fetchQueryDocs(query);
    if (!queryResult.success) return queryResult;
    return makeSuccessResult(queryResult.value as IntervalUserFeedSubscription[]);
  }

  public async fetchForRssFeedSourceByUrl(url: string): AsyncResult<RssUserFeedSubscription[]> {
    const query = this.userFeedSubscriptionsCollectionService
      .getCollectionRef()
      .where('feedSourceType', '==', FeedSourceType.RSS)
      .where('url', '==', url);

    const queryResult = await this.userFeedSubscriptionsCollectionService.fetchQueryDocs(query);
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
  ): AsyncResult<void> {
    return this.update(userFeedSubscriptionId, {
      isActive: false,
      // TODO(timestamps): Use server timestamps instead.
      unsubscribedTime: new Date(),
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
