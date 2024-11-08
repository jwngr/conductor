import {FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants';

import {FeedSubscription} from '@shared/types/feedSubscriptions.types';
import {UserId} from '@shared/types/user.types';

import {firestore} from '@src/lib/firebase';

import {batchDeleteFirestoreDocuments} from './batch';

/**
 * Hard-deletes all feed subscription data in Firestore associated with a user.
 */
export async function deleteFeedSubscriptionsDocsForUser(userId: UserId): Promise<void> {
  const userFeedItemDocs = await firestore
    .collection(FEED_SUBSCRIPTIONS_DB_COLLECTION)
    .where('userId', '==', userId)
    .get();

  await batchDeleteFirestoreDocuments(userFeedItemDocs.docs.map((doc) => doc.ref));
}

/**
 * Unsubscribes from all feed subscriptions associated with a user.
 */
export async function unsubscribeFromFeedSubscriptionsForUser(userId: UserId): Promise<void> {
  const userFeedSubscriptionDocs = await firestore
    .collection(FEED_SUBSCRIPTIONS_DB_COLLECTION)
    .where('userId', '==', userId)
    .get();

  // TODO: Batch this instead of doing it one at a time.
  for (const doc of userFeedSubscriptionDocs.docs) {
    await unsubscribeFromFeedSubscription(doc.data() as FeedSubscription);
  }
}

/**
 * Unsubscribes from an individual feed subscription.
 */
async function unsubscribeFromFeedSubscription(feedSubscription: FeedSubscription): Promise<void> {
  console.log(`Unsubscribing from feed subscription ${feedSubscription.feedSubscriptionId}...`);
  throw new Error(`TODO: Unsubscribing not yet implemented`);
}
