import {logger} from 'firebase-functions';

import {asyncTryAll} from '@shared/lib/errors';

import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';

import {deleteFeedItemDocsForUsers, deleteStorageFilesForUser} from '@src/lib/feedItems';
import {
  deleteFeedSubscriptionsDocsForUser,
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

  logger.info('[WIPEOUT] Unsubscribing from feed subscriptions...', logDetails);
  const unsubscribeResult = await unsubscribeFromFeedSubscriptionsForUser(userId);
  if (!unsubscribeResult.success) {
    logger.error(`[WIPEOUT] Failed to unsubscribe from feed subscriptions`, {
      error: unsubscribeResult.error,
      ...logDetails,
    });
    wasSuccessful = false;
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
