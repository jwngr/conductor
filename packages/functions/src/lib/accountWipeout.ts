import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {WipeoutService} from '@sharedServer/services/wipeout.server';

export async function wipeoutAccountHelper(args: {
  readonly firebaseUid: string;
  readonly wipeoutService: WipeoutService;
}): Promise<void> {
  const {firebaseUid, wipeoutService} = args;

  logger.log(`[WIPEOUT] Firebase user deleted. Processing account wipeout...`, {firebaseUid});

  const accountIdResult = parseAccountId(firebaseUid);
  if (!accountIdResult.success) {
    const error = prefixError(
      accountIdResult.error,
      '[WIPEOUT] Skipping wipeout due to invalid account ID'
    );
    logger.error(error, {firebaseUid});
    return;
  }
  const accountId = accountIdResult.value;

  const wipeoutAccountResult = await wipeoutService.wipeoutAccount(accountId);
  if (!wipeoutAccountResult.success) {
    const error = prefixError(wipeoutAccountResult.error, '[WIPEOUT] Failed to wipe out account');
    logger.error(error, {firebaseUid, accountId});
    return;
  }

  logger.log(`[WIPEOUT] Successfully wiped out account`, {accountId});
}
