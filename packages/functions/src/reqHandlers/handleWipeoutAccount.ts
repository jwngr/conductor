import {prefixErrorResult} from '@shared/lib/errorUtils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {AsyncResult} from '@shared/types/results.types';

import type {WipeoutService} from '@sharedServer/services/wipeout.server';

export async function handleWipeoutAccount(args: {
  readonly firebaseUid: string;
  readonly wipeoutService: WipeoutService;
}): AsyncResult<void> {
  const {firebaseUid, wipeoutService} = args;

  const accountIdResult = parseAccountId(firebaseUid);
  if (!accountIdResult.success) {
    return prefixErrorResult(accountIdResult, 'Invalid account ID');
  }

  const accountId = accountIdResult.value;
  return wipeoutService.wipeoutAccount(accountId);
}
