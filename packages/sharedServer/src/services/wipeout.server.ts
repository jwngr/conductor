import {logger} from '@shared/services/logger.shared';

import {asyncTryAll, prefixError} from '@shared/lib/errorUtils.shared';
import {batchAsyncResults} from '@shared/lib/utils.shared';

import type {AsyncResult} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import type {Supplier} from '@shared/types/utils.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import type {ServerImportQueueService} from '@sharedServer/services/importQueue.server';
import type {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';
import type {ServerUsersService} from '@sharedServer/services/users.server';

export class WipeoutService {
  private usersService: ServerUsersService;
  private userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
  private feedItemsService: ServerFeedItemsService;
  private importQueueService: ServerImportQueueService;

  constructor(args: {
    readonly usersService: ServerUsersService;
    readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
    readonly importQueueService: ServerImportQueueService;
    readonly feedItemsService: ServerFeedItemsService;
  }) {
    this.usersService = args.usersService;
    this.userFeedSubscriptionsService = args.userFeedSubscriptionsService;
    this.importQueueService = args.importQueueService;
    this.feedItemsService = args.feedItemsService;
  }

  /**
   * Permanently deletes all data associated with a user when their Firebase auth account is deleted.
   */
  public async wipeoutUser(userId: UserId): AsyncResult<void> {
    // Assume success until proven otherwise.
    let wasSuccessful = true;

    const logDetails = {userId} as const;

    logger.log(`[WIPEOUT] Fetching feed subscriptions for user ${userId}...`, logDetails);
    const userFeedSubscriptionsResult =
      await this.userFeedSubscriptionsService.fetchAllForUser(userId);
    if (!userFeedSubscriptionsResult.success) {
      logger.error(
        prefixError(
          userFeedSubscriptionsResult.error,
          '[WIPEOUT] Failed to fetch user feed subscriptions for user to wipe out'
        ),
        logDetails
      );
      wasSuccessful = false;
    }

    if (userFeedSubscriptionsResult.success) {
      const userFeedSubscriptions = userFeedSubscriptionsResult.value;
      const activeUserFeedSubscriptions = userFeedSubscriptions.filter(({isActive}) => isActive);
      const activeUserFeedSubscriptionIds = activeUserFeedSubscriptions.map(
        ({userFeedSubscriptionId}) => userFeedSubscriptionId
      );

      logger.log(
        `[WIPEOUT] Unsubscribing user ${userId} from active feed subscriptions (${activeUserFeedSubscriptionIds.length})`,
        {activeUserFeedSubscriptionIds, ...logDetails}
      );

      const unsubscribeFromFeedSuppliers: Supplier<AsyncResult<void>>[] =
        activeUserFeedSubscriptionIds.map((userFeedSubscriptionId) => async () => {
          logger.log(
            `[WIPEOUT] Unsubscribing user ${userId} from feed subscription ${userFeedSubscriptionId}...`,
            {userFeedSubscriptionId, ...logDetails}
          );
          return await this.userFeedSubscriptionsService.unsubscribeUserFromFeed(
            userFeedSubscriptionId
          );
        });

      const unsubscribeUserFromFeedsResult = await batchAsyncResults(
        unsubscribeFromFeedSuppliers,
        3
      );
      if (!unsubscribeUserFromFeedsResult.success) {
        logger.error(
          prefixError(
            unsubscribeUserFromFeedsResult.error,
            '[WIPEOUT] Failed to unsubscribe from feed subscriptions for user'
          ),
          logDetails
        );
        wasSuccessful = false;
      }
    }

    logger.log('[WIPEOUT] Wiping out Cloud Storage files for user...', logDetails);
    const deleteStorageFilesResult = await this.feedItemsService.deleteStorageFilesForUser(userId);
    if (!deleteStorageFilesResult.success) {
      logger.error(
        prefixError(
          deleteStorageFilesResult.error,
          '[WIPEOUT] Error wiping out Cloud Storage files for user'
        ),
        logDetails
      );
      wasSuccessful = false;
    }

    logger.log('[WIPEOUT] Wiping out Firestore data for user...', logDetails);
    const deleteFirestoreResult = await asyncTryAll([
      this.usersService.deleteUsersDocForUser(userId),
      this.feedItemsService.deleteAllForUser(userId),
      this.importQueueService.deleteAllForUser(userId),
      this.userFeedSubscriptionsService.deleteAllForUser(userId),
    ]);
    const deleteFirestoreResultError = deleteFirestoreResult.success
      ? deleteFirestoreResult.value.results.find((result) => !result.success)?.error
      : deleteFirestoreResult.error;
    if (deleteFirestoreResultError) {
      logger.error(
        prefixError(
          deleteFirestoreResultError,
          '[WIPEOUT] Error wiping out Firestore data for user'
        ),
        logDetails
      );
      wasSuccessful = false;
    }

    if (!wasSuccessful) {
      const error = new Error(
        `User not fully wiped out. See error logs for details on failure to wipe out user`
      );
      logger.error(error, logDetails);
      return makeErrorResult(error);
    }

    return makeSuccessResult(undefined);
  }
}
