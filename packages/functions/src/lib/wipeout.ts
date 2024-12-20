import {logger} from 'firebase-functions';

import {asyncTryAll} from '@shared/lib/errors';

import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';

import {deleteFeedItemDocsForUsers, deleteStorageFilesForUser} from '@src/lib/feedItems.func';
import {
  deleteFeedSubscriptionsDocsForUser,
  fetchFeedSubscriptionsForUser,
  unsubscribeFromFeedSubscriptions,
  unsubscribeFromFeedSubscriptionsForUser,
} from '@src/lib/feedSubscriptions';
import {deleteImportQueueDocsForUser} from '@src/lib/importQueue';
import {deleteUsersDocForUser} from '@src/lib/users';

/**
 * Hard-deletes all data associated with a user when their Firebase auth account is deleted.
 */
export async function wipeoutUser(userId: UserId): AsyncResult<void> {
  // Assume success until proven otherwise.
  let wasSuccessful = true;

  const logDetails = {userId} as const;

  logger.info(`[WIPEOUT] Fetching feed subscriptions for user ${userId}...`, logDetails);
  const feedSubscriptionsForUserResult = await fetchFeedSubscriptionsForUser(userId);
  if (!feedSubscriptionsForUserResult.success) {
    logger.error(`[WIPEOUT] Failed to fetch feed subscriptions for user`, {
      error: feedSubscriptionsForUserResult.error,
      ...logDetails,
    });
    return feedSubscriptionsForUserResult;
  }
  const feedSubscriptionsForUser = feedSubscriptionsForUserResult.value;

  const feedSubscriptionIds = feedSubscriptionsForUser.map(
    (feedSubscription) => feedSubscription.feedSubscriptionId
  );

  logger.info(
    `[WIPEOUT] Unsubscribing user ${userId} from ${feedSubscriptionsForUser.length} feed subscriptions`,
    {feedSubscriptionIds, ...logDetails}
  );

  const unsubscribeFromFeedSubscriptionsResult =
    await unsubscribeFromFeedSubscriptions(feedSubscriptionsForUser);
  if (!unsubscribeFromFeedSubscriptionsResult.success) {
    logger.error(`[WIPEOUT] Failed to unsubscribe from feed subscriptions for user`, {
      error: unsubscribeFromFeedSubscriptionsResult.error,
      feedSubscriptionIds,
      ...logDetails,
    });
    return unsubscribeFromFeedSubscriptionsResult;
  }

  logger.info('[WIPEOUT] Wiping out Cloud Storage files for user...', logDetails);
  const deleteStorageFilesResult = await deleteStorageFilesForUser(userId);
  if (!deleteStorageFilesResult.success) {
    logger.error(`[WIPEOUT] Error wiping out Cloud Storage files for user`, {
      error: deleteStorageFilesResult.error,
      ...logDetails,
    });
    wasSuccessful = false;
  }

  logger.info('[WIPEOUT] Wiping out Firestore data for user...', logDetails);
  const deleteFirestoreResult = await asyncTryAll<[undefined, undefined, undefined, undefined]>([
    deleteUsersDocForUser(userId),
    deleteFeedItemDocsForUsers(userId),
    deleteFeedSubscriptionsDocsForUser(userId),
    deleteImportQueueDocsForUser(userId),
  ]);
  if (!deleteFirestoreResult.success) {
    deleteFirestoreResult.error.forEach((currentError) => {
      logger.error(`[WIPEOUT] Error wiping out Firestore data for user`, {
        error: currentError,
        ...logDetails,
      });
    });
    wasSuccessful = false;
  }

  if (!wasSuccessful) {
    return makeErrorResult(
      new Error(
        `User not fully wiped out. See error logs for details on failure to wipe out user ${userId}`
      )
    );
  }

  return makeSuccessResult(undefined);
}
