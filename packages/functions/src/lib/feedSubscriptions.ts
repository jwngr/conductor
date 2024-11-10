import {DocumentSnapshot} from 'firebase-admin/firestore';

import {FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants';
import {batchAsyncResults} from '@shared/lib/utils';

import {
  FeedSubscription,
  FeedSubscriptionId,
  FeedSubscriptionStatus,
} from '@shared/types/feedSubscriptions.types';
import {AsyncResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';

import {
  batchDeleteFirestoreDocuments,
  FieldValue,
  firestore,
  getFirestoreQuerySnapshot,
} from '@src/lib/firebaseAdmin';

export async function createFeedSubscription(args: {
  readonly url: string;
  readonly userId: UserId;
}): Promise<[FeedSubscriptionId | null, Error | null]> {
  const {url, userId} = args;

  const newFeedSubscriptionDoc = await firestore.collection(FEED_SUBSCRIPTIONS_DB_COLLECTION).doc();
  const newFeedSubscriptionId = newFeedSubscriptionDoc.id;

  try {
    const feedSubscription: FeedSubscription = {
      feedSubscriptionId: newFeedSubscriptionId,
      url,
      userId,
      status: FeedSubscriptionStatus.Pending,
      createdTime: FieldValue.serverTimestamp(),
      lastUpdatedTime: FieldValue.serverTimestamp(),
    };
    await newFeedSubscriptionDoc.set(feedSubscription);
    return [newFeedSubscriptionId, null];
  } catch (error) {
    let betterError: Error;
    const prefix = `Error creating feed subscription:`;
    if (error instanceof Error) {
      betterError = new Error(`${prefix} ${error.message}`, {
        cause: error,
      });
    } else {
      betterError = new Error(`${prefix} ${error}`);
    }
    // TODO: Use logger.
    console.error(betterError.message, {error: betterError});
    return [null, betterError];
  }
}

export async function updateFeedSubscription(
  feedSubscriptionId: FeedSubscriptionId,
  update: Partial<Pick<FeedSubscription, 'status' | 'subscribedTime' | 'unsubscribedTime'>>
): Promise<[undefined, Error | null]> {
  try {
    await firestore
      .collection(FEED_SUBSCRIPTIONS_DB_COLLECTION)
      .doc(feedSubscriptionId)
      .update({
        ...update,
        lastUpdatedTime: FieldValue.serverTimestamp(),
      });
    return [undefined, null];
  } catch (error) {
    let betterError: Error;
    const prefix = `Error updating feed subscription ${feedSubscriptionId}:`;
    if (error instanceof Error) {
      betterError = new Error(`${prefix} ${error.message}`, {
        cause: error,
      });
    } else {
      betterError = new Error(`${prefix} ${error}`);
    }
    // TODO: Use logger.
    console.error(betterError.message, {error: betterError});
    return [undefined, betterError];
  }
}

/**
 * Hard-deletes all feed subscription data in Firestore associated with a user.
 */
export async function deleteFeedSubscriptionsDocsForUser(userId: UserId): AsyncResult<void> {
  const userFeedSubscriptionDocsResult = await getFirestoreQuerySnapshot(
    firestore.collection(FEED_SUBSCRIPTIONS_DB_COLLECTION).where('userId', '==', userId)
  );

  if (!userFeedSubscriptionDocsResult.success) {
    return userFeedSubscriptionDocsResult;
  }
  const userFeedSubscriptionDocs = userFeedSubscriptionDocsResult.value;

  return await batchDeleteFirestoreDocuments(
    userFeedSubscriptionDocs.docs.map((doc: DocumentSnapshot) => doc.ref)
  );
}

/**
 * Unsubscribes from all feed subscriptions associated with a user.
 */
export async function unsubscribeFromFeedSubscriptionsForUser(userId: UserId): AsyncResult<void> {
  const subscriptionQuerySnapshotResult = await getFirestoreQuerySnapshot(
    firestore.collection(FEED_SUBSCRIPTIONS_DB_COLLECTION).where('userId', '==', userId)
  );

  if (!subscriptionQuerySnapshotResult.success) {
    return subscriptionQuerySnapshotResult;
  }
  const subscriptionQuerySnapshot = subscriptionQuerySnapshotResult.value;

  const allUnsubscribeResults: AsyncResult<void>[] = subscriptionQuerySnapshot.docs.map(
    (doc: DocumentSnapshot) => unsubscribeFromFeedSubscription(doc.data() as FeedSubscription)
  );

  return batchAsyncResults(allUnsubscribeResults, 3);
}

/**
 * Unsubscribes from an individual feed subscription.
 */
async function unsubscribeFromFeedSubscription(feedSubscription: FeedSubscription): Promise<void> {
  console.log(`Unsubscribing from feed subscription ${feedSubscription.feedSubscriptionId}...`);

  await updateFeedSubscription(feedSubscription.feedSubscriptionId, {
    status: FeedSubscriptionStatus.Unsubscribed,
    unsubscribedTime: FieldValue.serverTimestamp(),
  });

  // TODO: Actually unsubscribe from the feed in Superfeedr.
}
