import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeDefaultAccountExperimentsState} from '@shared/lib/experiments.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {EmailAddress} from '@shared/types/emails.types';
import type {AsyncResult} from '@shared/types/results.types';

import {toStorageAccountExperimentsState} from '@shared/storage/experiments.storage';

import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';

interface CreateSampleExperimentsArgs {
  readonly accountId: AccountId;
  readonly email: EmailAddress;
  readonly firebaseService: ServerFirebaseService;
}

interface CreateSampleExperimentsResult {
  readonly count: number;
}

export async function createSampleExperiments(
  args: CreateSampleExperimentsArgs
): AsyncResult<CreateSampleExperimentsResult, Error> {
  const {accountId, email, firebaseService} = args;

  // Create default experiments state for the account.
  const accountExperimentsState = makeDefaultAccountExperimentsState({
    accountId,
    isInternalAccount: true, // Treat bootstrap accounts as internal for testing
  });

  // Save to Firestore.
  const storageData = toStorageAccountExperimentsState(accountExperimentsState);

  const saveResult = await asyncTry(async () => {
    await firebaseService.firestore
      .collection('accountExperiments')
      .doc(accountId)
      .set(storageData);
  });

  if (!saveResult.success) {
    return prefixErrorResult(saveResult, 'Failed to save account experiments state');
  }

  logger.log('[BOOTSTRAP] Successfully created experiments', {
    accountId,
    email,
  });

  return makeSuccessResult({
    count: 1, // We create one experiments document
  });
}
