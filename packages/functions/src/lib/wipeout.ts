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
export async function wipeoutUser(userId: UserId): Promise<void> {
  let wasSuccessful = true;

  console.log(`[WIPEOUT] Unsubscribing from all feed subscriptions for user ${userId}...`);
  try {
    await unsubscribeFromFeedSubscriptionsForUser(userId);
  } catch (error) {
    console.error(
      `[WIPEOUT] Error unsubscribing from all feed subscriptions for user ${userId}:`,
      error
    );
    wasSuccessful = false;
  }

  console.log(`[WIPEOUT] Wiping out Cloud Storage files for user ${userId}...`);
  try {
    await deleteStorageFilesForUser(userId);
  } catch (error) {
    console.error(`[WIPEOUT] Error wiping out Cloud Storage files for user ${userId}:`, error);
    wasSuccessful = false;
  }

  console.log(`[WIPEOUT] Wiping out Firestore data for user ${userId}...`);
  try {
    await Promise.all([
      deleteUsersDocForUser(userId),
      deleteFeedItemDocsForUsers(userId),
      deleteFeedSubscriptionsDocsForUser(userId),
      deleteImportQueueDocsForUser(userId),
    ]);
  } catch (error) {
    console.error(`[WIPEOUT] Error wiping out Firestore data for user ${userId}:`, error);
    wasSuccessful = false;
  }

  if (!wasSuccessful) {
    throw new Error(`See error logs for details on failure to wipe out user ${userId}`);
  }
}
