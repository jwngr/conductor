import {logger} from 'firebase-functions';

import {asyncTryAll} from '@shared/lib/errors';
import {batchAsyncResults} from '@shared/lib/utils';

import type {AsyncResult} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import type {Supplier} from '@shared/types/utils.types';

import type {ServerFeedItemsService} from '@sharedServer/lib/feedItems.server';
import type {ServerImportQueueService} from '@sharedServer/lib/importQueue.server';
import type {ServerUserFeedSubscriptionsService} from '@sharedServer/lib/userFeedSubscriptions.server';
import type {ServerUsersService} from '@sharedServer/lib/users.server';

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

    logger.info(`[WIPEOUT] Fetching feed subscriptions for user ${userId}...`, logDetails);
    const userFeedSubscriptionsResult =
      await this.userFeedSubscriptionsService.fetchAllForUser(userId);
    if (!userFeedSubscriptionsResult.success) {
      logger.error(`[WIPEOUT] Failed to fetch user feed subscriptions for user to wipe out`, {
        ...logDetails,
        error: userFeedSubscriptionsResult.error,
      });
      wasSuccessful = false;
    }

    if (userFeedSubscriptionsResult.success) {
      const userFeedSubscriptions = userFeedSubscriptionsResult.value;
      const activeUserFeedSubscriptions = userFeedSubscriptions.filter(({isActive}) => isActive);
      const activeUserFeedSubscriptionIds = activeUserFeedSubscriptions.map(
        ({userFeedSubscriptionId}) => userFeedSubscriptionId
      );

      logger.info(
        `[WIPEOUT] Unsubscribing user ${userId} from active feed subscriptions (${activeUserFeedSubscriptionIds.length})`,
        {activeUserFeedSubscriptionIds, ...logDetails}
      );

      const unsubscribeFromFeedSuppliers: Supplier<AsyncResult<void>>[] =
        activeUserFeedSubscriptionIds.map((userFeedSubscriptionId) => async () => {
          logger.info(
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
        logger.error(`[WIPEOUT] Failed to unsubscribe from feed subscriptions for user`, {
          ...logDetails,
          error: unsubscribeUserFromFeedsResult.error,
          activeUserFeedSubscriptionIds,
        });
        wasSuccessful = false;
      }
    }

    logger.info('[WIPEOUT] Wiping out Cloud Storage files for user...', logDetails);
    const deleteStorageFilesResult = await this.feedItemsService.deleteStorageFilesForUser(userId);
    if (!deleteStorageFilesResult.success) {
      logger.error(`[WIPEOUT] Error wiping out Cloud Storage files for user`, {
        ...logDetails,
        error: deleteStorageFilesResult.error,
      });
      wasSuccessful = false;
    }

    logger.info('[WIPEOUT] Wiping out Firestore data for user...', logDetails);
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
      logger.error(`[WIPEOUT] Error wiping out Firestore data for user`, {
        ...logDetails,
        error: deleteFirestoreResultError,
      });
      wasSuccessful = false;
    }

    if (!wasSuccessful) {
      const errorMessage = `User not fully wiped out. See error logs for details on failure to wipe out user ${userId}`;
      logger.error(errorMessage, logDetails);
      return makeErrorResult(new Error(errorMessage));
    }

    return makeSuccessResult(undefined);
  }
}
