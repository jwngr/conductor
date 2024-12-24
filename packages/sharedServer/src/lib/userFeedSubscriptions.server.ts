import type {CollectionReference, DocumentSnapshot} from 'firebase-admin/firestore';

import {asyncTry, prefixError} from '@shared/lib/errors';

import type {Feed} from '@shared/types/feeds.types';
import type {AsyncResult} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import {makeUserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {
  batchDeleteFirestoreDocuments,
  FieldValue,
  getFirestoreQuerySnapshot,
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
    const docsQuery = this.userFeedSubscriptionsDbRef.where('userId', '==', userId);
    const docsQueryResult = await getFirestoreQuerySnapshot(docsQuery);
    if (!docsQueryResult.success) {
      return makeErrorResult(
        prefixError(docsQueryResult.error, 'Error fetching user feed subscriptions for user')
      );
    }

    const userFeedSubscriptions = docsQueryResult.value.docs.map(
      (doc: DocumentSnapshot) => doc.data() as UserFeedSubscription
    );
    return makeSuccessResult(userFeedSubscriptions);
  }

  /**
   * Adds a new user feed subscription document to Firestore.
   */
  public async subscribeUserToFeed(args: {
    feed: Feed;
    userId: UserId;
  }): AsyncResult<UserFeedSubscription> {
    const {feed, userId} = args;

    // Make a new user feed subscription object.
    const userFeedSubscriptionResult = makeUserFeedSubscription({feed, userId});
    if (!userFeedSubscriptionResult.success) return userFeedSubscriptionResult;
    const newUserFeedSubscription = userFeedSubscriptionResult.value;

    // Add the new user feed subscription to Firestore.
    const userFeedSubscriptionId = newUserFeedSubscription.userFeedSubscriptionId;
    const userFeedSubscriptionDocRef = this.userFeedSubscriptionsDbRef.doc(userFeedSubscriptionId);
    const saveToDbResult = await asyncTry(
      async () => await userFeedSubscriptionDocRef.set(newUserFeedSubscription)
    );
    if (!saveToDbResult.success) {
      return makeErrorResult(
        prefixError(saveToDbResult.error, 'Error creating user feed subscription in Firestore')
      );
    }

    return makeSuccessResult(newUserFeedSubscription);
  }

  /**
   * Deactivates a user's subscription to an individual feed.
   */
  public async unsubscribeUserFromFeed(
    userFeedSubscriptionId: UserFeedSubscriptionId
  ): AsyncResult<void> {
    const updateResult = await this.update(userFeedSubscriptionId, {
      isActive: false,
      unsubscribedTime: FieldValue.serverTimestamp(),
    });
    if (!updateResult.success) return updateResult;

    return makeSuccessResult(undefined);
  }

  /**
   * Updates a user feed subscription document in Firestore.
   */
  public async update(
    userFeedSubscriptionId: UserFeedSubscriptionId,
    update: Partial<Pick<UserFeedSubscription, 'isActive' | 'unsubscribedTime'>>
  ): AsyncResult<void> {
    const userFeedSubscriptionDocRef = this.userFeedSubscriptionsDbRef.doc(userFeedSubscriptionId);
    const updateResult = await asyncTry(async () => {
      await userFeedSubscriptionDocRef.update({
        ...update,
        lastUpdatedTime: FieldValue.serverTimestamp(),
      });
    });

    if (!updateResult.success) {
      return makeErrorResult(
        prefixError(updateResult.error, 'Error updating user feed subscription in Firestore')
      );
    }

    return makeSuccessResult(undefined);
  }

  /**
   * Permanently deletes a feed subscription document from Firestore.
   */
  public async delete(userFeedSubscriptionId: UserFeedSubscriptionId): AsyncResult<void> {
    const userFeedSubscriptionDocRef = this.userFeedSubscriptionsDbRef.doc(userFeedSubscriptionId);
    const deleteResult = await asyncTry(async () => await userFeedSubscriptionDocRef.delete());
    if (!deleteResult.success) {
      return makeErrorResult(
        prefixError(deleteResult.error, 'Error deleting user feed subscription in Firestore')
      );
    }

    return makeSuccessResult(undefined);
  }

  /**
   * Permanently deletes all user feed subscription documents associated with a user from Firestore.
   */
  public async deleteAllForUser(userId: UserId): AsyncResult<void> {
    const docsQuery = this.userFeedSubscriptionsDbRef.where('userId', '==', userId);
    const docsQueryResult = await getFirestoreQuerySnapshot(docsQuery);
    if (!docsQueryResult.success) {
      return makeErrorResult(
        prefixError(
          docsQueryResult.error,
          'Error fetching user feed subscriptions to delete in Firestore'
        )
      );
    }

    const subscriptionDocs = docsQueryResult.value;

    return await batchDeleteFirestoreDocuments(
      subscriptionDocs.docs.map((doc: DocumentSnapshot) => doc.ref)
    );
  }
}
