import {makeSuccessResult} from '@shared/lib/results.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {Account} from '@shared/types/accounts.types';
import type {Result} from '@shared/types/results.types';

import type {AccountFromStorage} from '@shared/schemas/accounts.schema';

/**
 * Converts an {@link AccountFromStorage} into an {@link Account}.
 */
export function fromStorageAccount(accountFromStorage: AccountFromStorage): Result<Account> {
  const parsedAccountIdResult = parseAccountId(accountFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedEmailResult = parseEmailAddress(accountFromStorage.email);
  if (!parsedEmailResult.success) return parsedEmailResult;

  return makeSuccessResult({
    accountId: parsedAccountIdResult.value,
    email: parsedEmailResult.value,
    displayName: accountFromStorage.displayName,
  });
}

/**
 * Converts an {@link Account} into an {@link AccountFromStorage}.
 */
export function toStorageAccount(account: Account): AccountFromStorage {
  return {
    accountId: account.accountId,
    email: account.email,
    displayName: account.displayName,
  };
}
