import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {AsyncResult} from '@shared/types/results.types';

import {ServerAccountSettingsService} from '@sharedServer/services/accountSettings.server';
import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';

interface BootstrapAccountDataArgs {
  readonly accountId: AccountId;
  readonly email: string;
  readonly firebaseService: ServerFirebaseService;
}

interface BootstrapAccountDataResult {
  readonly accountId: AccountId;
}

export async function bootstrapAccountData(
  args: BootstrapAccountDataArgs
): AsyncResult<BootstrapAccountDataResult, Error> {
  const {accountId, email, firebaseService} = args;

  // Initialize services needed for account data bootstrapping.
  const accountSettingsService = new ServerAccountSettingsService({firebaseService});

  // Bootstrap account settings with defaults.
  const settingsResult = await accountSettingsService.initializeForAccount({accountId});
  if (!settingsResult.success) {
    return prefixErrorResult(settingsResult, 'Failed to initialize account settings');
  }

  logger.log('[BOOTSTRAP] Successfully bootstrapped account data', {accountId, email});
  return makeSuccessResult({accountId});
}
