import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeErrorResult} from '@shared/lib/results.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {AsyncResult} from '@shared/types/results.types';

import type {ServerAccountsService} from '@sharedServer/services/accounts.server';

export async function handleCreateAccount(args: {
  readonly firebaseUid: string;
  readonly email: string | undefined;
  readonly accountsService: ServerAccountsService;
}): AsyncResult<void, Error> {
  const {firebaseUid, email, accountsService} = args;

  const parsedAccountIdResult = parseAccountId(firebaseUid);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;
  const parsedAccountId = parsedAccountIdResult.value;

  if (!email) {
    return makeErrorResult(new Error('No email address'));
  }

  const parsedEmailResult = parseEmailAddress(email);
  if (!parsedEmailResult.success) {
    return prefixErrorResult(parsedEmailResult, 'Invalid email address');
  }
  const parsedEmail = parsedEmailResult.value;

  return accountsService.addAccount({accountId: parsedAccountId, email: parsedEmail});
}
