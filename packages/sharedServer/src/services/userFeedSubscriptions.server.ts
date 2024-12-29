import {FieldValue} from 'firebase-admin/firestore';

import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {FeedSource} from '@shared/types/feedSources.types';
import {makeSuccessResult, type AsyncResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import {makeUserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

type UserFeedSubscriptionsCollectionService = ServerFirestoreCollectionService<
  UserFeedSubscriptionId,
  UserFeedSubscription
>;

export class ServerUserFeedSubscriptionsService {
  private readonly userFeedSubscriptionsCollectionService: UserFeedSubscriptionsCollectionService;

  constructor(args: {
    readonly userFeedSubscriptionsCollectionService: UserFeedSubscriptionsCollectionService;
  }) {
    this.userFeedSubscriptionsCollectionService = args.userFeedSubscriptionsCollectionService;
  }

  /**
   * Fetches all user feed subscription documents for an individual user from Firestore.
   */
  public async fetchAllForUser(userId: UserId): AsyncResult<UserFeedSubscription[]> {
    const query = this.userFeedSubscriptionsCollectionService
      .getCollectionRef()
      .where('userId', '==', userId);
    const queryResult = await this.userFeedSubscriptionsCollectionService.fetchQueryDocs(query);
    return prefixResultIfError(queryResult, 'Error fetching user feed subscriptions for user');
  }

  /**
   * Adds a new user feed subscription document to Firestore.
   */
  public async create(args: {
    feedSource: FeedSource;
    userId: UserId;
  }): AsyncResult<UserFeedSubscription> {
    const {feedSource, userId} = args;

    // Make a new user feed subscription object locally.
    const userFeedSubscriptionResult = makeUserFeedSubscription({feedSource, userId});
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
   * Deactivates a user's subscription to an individual feed source.
   */
  public async unsubscribeUserFromFeed(
    userFeedSubscriptionId: UserFeedSubscriptionId
  ): AsyncResult<void> {
    return this.update(userFeedSubscriptionId, {
      isActive: false,
      // TODO: Make this less hacky.
      unsubscribedTime: FieldValue.serverTimestamp() as unknown as Date,
    });
  }

  /**
   * Updates a user feed subscription document in Firestore.
   */
  public async update(
    userFeedSubscriptionId: UserFeedSubscriptionId,
    update: Partial<Pick<UserFeedSubscription, 'isActive' | 'unsubscribedTime'>>
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
   * Permanently deletes all user feed subscription documents associated with a user from Firestore.
   */
  public async deleteAllForUser(userId: UserId): AsyncResult<void> {
    // Fetch the IDs for all of the user's feed subscriptions.
    const query = this.userFeedSubscriptionsCollectionService
      .getCollectionRef()
      .where('userId', '==', userId);
    const queryResult = await this.userFeedSubscriptionsCollectionService.fetchQueryIds(query);
    if (!queryResult.success) {
      return prefixErrorResult(
        queryResult,
        'Error fetching user feed subscriptions to delete in Firestore'
      );
    }

    // Delete all of the user's feed subscriptions.
    const docIdsToDelete = queryResult.value;
    return await this.userFeedSubscriptionsCollectionService.batchDeleteDocs(docIdsToDelete);
  }
}
