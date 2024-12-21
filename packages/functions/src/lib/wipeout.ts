import {logger} from 'firebase-functions';

import {asyncTryAll} from '@shared/lib/errors';
import {batchAsyncResults} from '@shared/lib/utils';

import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';
import {Supplier} from '@shared/types/utils.types';

import {deleteFeedItemDocsForUsers, deleteStorageFilesForUser} from '@src/lib/feedItems.func';
import {deleteImportQueueDocsForUser} from '@src/lib/importQueue';
import {adminUserFeedSubscriptionsService} from '@src/lib/userFeedSubscriptions.func';
import {deleteUsersDocForUser} from '@src/lib/users';

/**
 * Hard-deletes all data associated with a user when their Firebase auth account is deleted.
 */
export async function wipeoutUser(userId: UserId): AsyncResult<void> {
  // Assume success until proven otherwise.
  let wasSuccessful = true;

  const logDetails = {userId} as const;

  logger.info(`[WIPEOUT] Fetching feed subscriptions for user ${userId}...`, logDetails);
  const userFeedSubscriptionsResult =
    await adminUserFeedSubscriptionsService.fetchAllForUser(userId);
  if (!userFeedSubscriptionsResult.success) {
    logger.error(`[WIPEOUT] Failed to fetch user feed subscriptions for user`, {
      error: userFeedSubscriptionsResult.error,
      ...logDetails,
    });
    wasSuccessful = false;
  }

  if (userFeedSubscriptionsResult.success) {
    const userFeedSubscriptions = userFeedSubscriptionsResult.value;
    const userFeedSubscriptionIds = userFeedSubscriptions.map(
      ({userFeedSubscriptionId}) => userFeedSubscriptionId
    );

    logger.info(
      `[WIPEOUT] Unsubscribing user ${userId} from ${userFeedSubscriptions.length} feed subscriptions`,
      {userFeedSubscriptionIds, ...logDetails}
    );

    const unsubscribeFromFeedSuppliers: Supplier<AsyncResult<void>>[] = userFeedSubscriptionIds.map(
      (userFeedSubscriptionId) => async () => {
        logger.info(
          `[WIPEOUT] Unsubscribing user ${userId} from feed subscription ${userFeedSubscriptionId}...`,
          {userFeedSubscriptionId, ...logDetails}
        );
        return await adminUserFeedSubscriptionsService.unsubscribeUserFromFeed(
          userFeedSubscriptionId
        );
      }
    );

    const unsubscribeUserFromFeedsResult = await batchAsyncResults(unsubscribeFromFeedSuppliers, 3);
    if (!unsubscribeUserFromFeedsResult.success) {
      logger.error(`[WIPEOUT] Failed to unsubscribe from feed subscriptions for user`, {
        error: unsubscribeUserFromFeedsResult.error,
        userFeedSubscriptionIds,
        ...logDetails,
      });
      wasSuccessful = false;
    }
  }

  // TODO: Should I just delete using the list of IDs I already have instead?
  logger.info('[WIPEOUT] Deleting user feed subscriptions for user...', logDetails);
  const deleteUserFeedSubscriptionsResult =
    await adminUserFeedSubscriptionsService.deleteAllForUser(userId);
  if (!deleteUserFeedSubscriptionsResult.success) {
    logger.error(`[WIPEOUT] Error deleting feed subscriptions for user`, {
      error: deleteUserFeedSubscriptionsResult.error,
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
    adminUserFeedSubscriptionsService.deleteAllForUser(userId),
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
