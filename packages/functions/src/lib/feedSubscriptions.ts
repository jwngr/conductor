import {DocumentSnapshot} from 'firebase-admin/firestore';
import {logger} from 'firebase-functions';

import {FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants';
import {batchAsyncResults} from '@shared/lib/utils';

import {FeedSubscription} from '@shared/types/feedSubscriptions.types';
import {AsyncResult, makeErrorResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';

import {
  batchDeleteFirestoreDocuments,
  firestore,
  getFirestoreQuerySnapshot,
} from '@src/lib/firebaseAdmin';

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
async function unsubscribeFromFeedSubscription(
  feedSubscription: FeedSubscription
): AsyncResult<void> {
  logger.info(`Unsubscribing from feed subscription ${feedSubscription.feedSubscriptionId}...`);
  return makeErrorResult(new Error(`TODO: Unsubscribing not yet implemented`));
}
