import {logger} from '@shared/services/logger.shared';

import {asyncTryAll, prefixError} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {batchAsyncResults} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {Supplier} from '@shared/types/utils.types';

import type {ServerAccountsService} from '@sharedServer/services/accounts.server';
import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import type {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';

export class WipeoutService {
  private accountsService: ServerAccountsService;
  private userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
  private feedItemsService: ServerFeedItemsService;

  constructor(args: {
    readonly accountsService: ServerAccountsService;
    readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
    readonly feedItemsService: ServerFeedItemsService;
  }) {
    this.accountsService = args.accountsService;
    this.userFeedSubscriptionsService = args.userFeedSubscriptionsService;
    this.feedItemsService = args.feedItemsService;
  }

  /**
   * Permanently deletes all data associated with an account.
   */
  public async wipeoutAccount(accountId: AccountId): AsyncResult<void> {
    // Assume success until proven otherwise.
    let wasSuccessful = true;

    const logDetails = {accountId} as const;

    logger.log(`[WIPEOUT] Fetching feed subscriptions for account ${accountId}...`, logDetails);
    const userFeedSubscriptionsResult =
      await this.userFeedSubscriptionsService.fetchAllForAccount(accountId);
    if (!userFeedSubscriptionsResult.success) {
      logger.error(
        prefixError(
          userFeedSubscriptionsResult.error,
          '[WIPEOUT] Failed to fetch user feed subscriptions for account to wipe out'
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
        `[WIPEOUT] Unsubscribing account ${accountId} from active feed subscriptions (${activeUserFeedSubscriptionIds.length})`,
        {activeUserFeedSubscriptionIds, ...logDetails}
      );

      const unsubscribeFromFeedSuppliers: Array<Supplier<AsyncResult<void>>> =
        activeUserFeedSubscriptionIds.map((userFeedSubscriptionId) => async () => {
          logger.log(
            `[WIPEOUT] Unsubscribing account ${accountId} from feed subscription ${userFeedSubscriptionId}...`,
            {userFeedSubscriptionId, ...logDetails}
          );
          return await this.userFeedSubscriptionsService.deactivateFeedSubscription(
            userFeedSubscriptionId
          );
        });

      const unsubscribeFromFeedsResult = await batchAsyncResults(unsubscribeFromFeedSuppliers, 3);
      if (!unsubscribeFromFeedsResult.success) {
        logger.error(
          prefixError(
            unsubscribeFromFeedsResult.error,
            '[WIPEOUT] Failed to unsubscribe from feed subscriptions for account'
          ),
          logDetails
        );
        wasSuccessful = false;
      }
    }

    logger.log('[WIPEOUT] Wiping out Cloud Storage files for account...', logDetails);
    const deleteStorageFilesResult =
      await this.feedItemsService.deleteStorageFilesForAccount(accountId);
    if (!deleteStorageFilesResult.success) {
      logger.error(
        prefixError(
          deleteStorageFilesResult.error,
          '[WIPEOUT] Error wiping out Cloud Storage files for account'
        ),
        logDetails
      );
      wasSuccessful = false;
    }

    logger.log('[WIPEOUT] Wiping out Firestore data for account...', logDetails);
    const deleteFirestoreResult = await asyncTryAll([
      this.accountsService.deleteAccount(accountId),
      this.feedItemsService.deleteAllForAccount(accountId),
      this.userFeedSubscriptionsService.deleteAllForAccount(accountId),
    ]);
    const deleteFirestoreResultError = deleteFirestoreResult.success
      ? deleteFirestoreResult.value.results.find((result) => !result.success)?.error
      : deleteFirestoreResult.error;
    if (deleteFirestoreResultError) {
      logger.error(
        prefixError(
          deleteFirestoreResultError,
          '[WIPEOUT] Error wiping out Firestore data for account'
        ),
        logDetails
      );
      wasSuccessful = false;
    }

    if (!wasSuccessful) {
      const error = new Error(
        `Account not fully wiped out. See error logs for details on failure to wipe out account`
      );
      logger.error(error, logDetails);
      return makeErrorResult(error);
    }

    return makeSuccessResult(undefined);
  }
}
