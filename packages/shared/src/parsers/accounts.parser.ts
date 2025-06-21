import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {Account} from '@shared/types/accounts.types';
import type {AccountId} from '@shared/types/ids.types';
import type {Result} from '@shared/types/results.types';

import {AccountIdSchema, AccountSchema} from '@shared/schemas/accounts.schema';
import {fromStorageAccount} from '@shared/storage/accounts.storage';

/**
 * Attempts to parse a plain string into an {@link AccountId}.
 */
export function parseAccountId(maybeAccountId: string): Result<AccountId, Error> {
  const parsedResult = parseZodResult(AccountIdSchema, maybeAccountId);
  if (!parsedResult.success) return prefixErrorResult(parsedResult, 'Invalid account ID');
  return makeSuccessResult(parsedResult.value as AccountId);
}

/**
 * Attempts to parse an unknown value into an {@link Account}.
 */
export function parseAccount(maybeAccount: unknown): Result<Account, Error> {
  const parsedResult = parseZodResult(AccountSchema, maybeAccount);
  if (!parsedResult.success) return prefixErrorResult(parsedResult, 'Failed to parse account');

  const accountFromStorage = parsedResult.value;
  return fromStorageAccount(accountFromStorage);
}
