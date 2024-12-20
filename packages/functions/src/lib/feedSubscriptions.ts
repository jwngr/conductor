import {DocumentSnapshot} from 'firebase-admin/firestore';
import {logger} from 'firebase-functions';

import {FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants';
import {batchAsyncResults} from '@shared/lib/utils';

import {FeedSubscription} from '@shared/types/feedSubscriptions.types';
import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';
import {Supplier} from '@shared/types/utils.types';

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
 * Fetches all feed subscriptions associated with a user.
 */
export async function fetchFeedSubscriptionsForUser(
  userId: UserId
): AsyncResult<FeedSubscription[]> {
  const subscriptionQuerySnapshotResult = await getFirestoreQuerySnapshot(
    firestore.collection(FEED_SUBSCRIPTIONS_DB_COLLECTION).where('userId', '==', userId)
  );

  if (!subscriptionQuerySnapshotResult.success) {
    return subscriptionQuerySnapshotResult;
  }
  const subscriptionQuerySnapshot = subscriptionQuerySnapshotResult.value;

  const feedSubscriptionsForUserResult: FeedSubscription[] = subscriptionQuerySnapshot.docs.map(
    (doc) => doc.data() as FeedSubscription
  );

  return makeSuccessResult(feedSubscriptionsForUserResult);
}

/**
 * Unsubscribes from the provided feed subscriptions in batches.
 */
export async function unsubscribeFromFeedSubscriptions(
  feedSubscriptions: FeedSubscription[]
): AsyncResult<void> {
  const allUnsubscribeResults: Supplier<AsyncResult<void>>[] = feedSubscriptions.map(
    (feedSubscription) => {
      logger.info(`Unsubscribing from feed subscription ${feedSubscription.feedSubscriptionId}...`);
      return () => unsubscribeFromFeedSubscription(feedSubscription);
    }
  );

  const batchSize = 3;
  return batchAsyncResults(allUnsubscribeResults, batchSize);
}

/**
 * Unsubscribes from an individual feed subscription.
 *
 * TODO: Implement feed subscription unsubscribing.
 */
async function unsubscribeFromFeedSubscription(
  feedSubscription: FeedSubscription
): AsyncResult<void> {
  return makeErrorResult(
    new Error(`TODO: Unsubscribing not yet implemented for ${feedSubscription.feedSubscriptionId}`)
  );
}
