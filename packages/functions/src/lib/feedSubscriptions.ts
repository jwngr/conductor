import {DocumentSnapshot, QuerySnapshot} from 'firebase-admin/firestore';
import {logger} from 'firebase-functions';

import {FEED_SUBSCRIPTIONS_DB_COLLECTION} from '@shared/lib/constants';
import {batchPromises} from '@shared/lib/utils';

import {FeedSubscription} from '@shared/types/feedSubscriptions.types';
import {UserId} from '@shared/types/user.types';

import {firestore} from '@src/lib/firebaseAdmin';

import {batchDeleteFirestoreDocuments} from './batch';

/**
 * Hard-deletes all feed subscription data in Firestore associated with a user.
 */
export async function deleteFeedSubscriptionsDocsForUser(userId: UserId): Promise<void> {
  const userFeedItemDocs = (await firestore
    .collection(FEED_SUBSCRIPTIONS_DB_COLLECTION)
    .where('userId', '==', userId)
    .get()) as QuerySnapshot<FeedSubscription>;

  await batchDeleteFirestoreDocuments(
    userFeedItemDocs.docs.map((doc: DocumentSnapshot) => doc.ref)
  );
}

/**
 * Unsubscribes from all feed subscriptions associated with a user.
 */
export async function unsubscribeFromFeedSubscriptionsForUser(userId: UserId): Promise<void> {
  const userFeedSubscriptionDocs = (await firestore
    .collection(FEED_SUBSCRIPTIONS_DB_COLLECTION)
    .where('userId', '==', userId)
    .get()) as QuerySnapshot<FeedSubscription>;

  const allUnsubscribePromises = userFeedSubscriptionDocs.docs.map(
    (doc: DocumentSnapshot<FeedSubscription>) =>
      unsubscribeFromFeedSubscription(doc.data() as FeedSubscription)
  );

  await batchPromises(allUnsubscribePromises, 3);
}

/**
 * Unsubscribes from an individual feed subscription.
 */
async function unsubscribeFromFeedSubscription(feedSubscription: FeedSubscription): Promise<void> {
  logger.log(`Unsubscribing from feed subscription ${feedSubscription.feedSubscriptionId}...`);
  throw new Error(`TODO: Unsubscribing not yet implemented`);
}
