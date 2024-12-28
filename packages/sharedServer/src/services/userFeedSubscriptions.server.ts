import type {CollectionReference} from 'firebase-admin/firestore';
import {FieldValue} from 'firebase-admin/firestore';

import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
} from '@shared/parsers/userFeedSubscriptions.parser';

import type {FeedSource} from '@shared/types/feedSources.types';
import type {AsyncResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import {makeUserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {
  batchDeleteChildIds,
  deleteFirestoreDoc,
  getFirestoreQueryData,
  getFirestoreQueryIds,
  setFirestoreDoc,
  updateFirestoreDoc,
} from '@sharedServer/lib/firebase.server';

export class ServerUserFeedSubscriptionsService {
  private userFeedSubscriptionsDbRef: CollectionReference;

  constructor(args: {readonly userFeedSubscriptionsDbRef: CollectionReference}) {
    this.userFeedSubscriptionsDbRef = args.userFeedSubscriptionsDbRef;
  }

  /**
   * Fetches all user feed subscription documents for an individual user from Firestore.
   */
  public async fetchAllForUser(userId: UserId): AsyncResult<UserFeedSubscription[]> {
    const query = this.userFeedSubscriptionsDbRef.where('userId', '==', userId);
    const queryResult = await getFirestoreQueryData(query, parseUserFeedSubscription);
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
    const userFeedSubscriptionResult = makeUserFeedSubscription({
      feedSource,
      userId,
      createdTime: FieldValue.serverTimestamp(),
      lastUpdatedTime: FieldValue.serverTimestamp(),
    });
    if (!userFeedSubscriptionResult.success) return userFeedSubscriptionResult;
    const newUserFeedSubscription = userFeedSubscriptionResult.value;

    // Add the new user feed subscription to Firestore.
    const userFeedSubscriptionId = newUserFeedSubscription.userFeedSubscriptionId;
    const userFeedSubscriptionDocRef = this.userFeedSubscriptionsDbRef.doc(userFeedSubscriptionId);
    const createResult = await setFirestoreDoc(userFeedSubscriptionDocRef, newUserFeedSubscription);
    return prefixResultIfError(createResult, 'Error creating user feed subscription in Firestore');
  }

  /**
   * Deactivates a user's subscription to an individual feed source.
   */
  public async unsubscribeUserFromFeed(
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
    update: Partial<Pick<UserFeedSubscription, 'isActive' | 'unsubscribedTime'>>
  ): AsyncResult<void> {
    const docToUpdateRef = this.userFeedSubscriptionsDbRef.doc(userFeedSubscriptionId);
    const updateResult = await updateFirestoreDoc(docToUpdateRef, update);
    return prefixResultIfError(updateResult, 'Error updating user feed subscription in Firestore');
  }

  /**
   * Permanently deletes a feed subscription document from Firestore.
   */
  public async delete(userFeedSubscriptionId: UserFeedSubscriptionId): AsyncResult<void> {
    const docToDeleteRef = this.userFeedSubscriptionsDbRef.doc(userFeedSubscriptionId);
    const deleteResult = await deleteFirestoreDoc(docToDeleteRef);
    return prefixResultIfError(deleteResult, 'Error deleting user feed subscription in Firestore');
  }

  /**
   * Permanently deletes all user feed subscription documents associated with a user from Firestore.
   */
  public async deleteAllForUser(userId: UserId): AsyncResult<void> {
    // Fetch the IDs for all of the user's feed subscriptions.
    const query = this.userFeedSubscriptionsDbRef.where('userId', '==', userId);
    const queryResult = await getFirestoreQueryIds(query, parseUserFeedSubscriptionId);
    if (!queryResult.success) {
      return prefixErrorResult(
        queryResult,
        'Error fetching user feed subscriptions to delete in Firestore'
      );
    }

    // Delete all of the user's feed subscriptions.
    const docIdsToDelete = queryResult.value;
    return await batchDeleteChildIds(this.userFeedSubscriptionsDbRef, docIdsToDelete);
  }
}
