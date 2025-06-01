import type {z} from 'zod';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {Account, AccountId} from '@shared/types/accounts.types';
import type {Result} from '@shared/types/results.types';

import {AccountIdSchema, AccountSchema} from '@shared/schemas/accounts.schema';

/**
 * Parses a {@link AccountId} from a plain string. Returns an `ErrorResult` if the string is not valid.
 */
export function parseAccountId(maybeAccountId: string): Result<AccountId> {
  const parsedResult = parseZodResult(AccountIdSchema, maybeAccountId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid account ID');
  }
  return makeSuccessResult(parsedResult.value as AccountId);
}

/**
 * Parses a generic {@link Account} from an unknown object. Returns an `ErrorResult` if the object
 * is not valid.
 */
export function parseAccount(maybeAccount: unknown): Result<Account> {
  const parsedResult = parseZodResult(AccountSchema, maybeAccount);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid account');
  }

  const parsedAccountIdResult = parseAccountId(parsedResult.value.accountId);
  if (!parsedAccountIdResult.success) return makeErrorResult(parsedAccountIdResult.error);

  const parsedEmailResult = parseEmailAddress(parsedResult.value.email);
  if (!parsedEmailResult.success) return makeErrorResult(parsedEmailResult.error);

  return makeSuccessResult({
    accountId: parsedAccountIdResult.value,
    email: parsedEmailResult.value,
    displayName: parsedResult.value.displayName,
  });
}

/**
 * Converts an {@link Account} to an {@link AccountFromStorage} object that can be persisted to
 * Firestore.
 */
export function toStorageAccount(account: Account): z.infer<typeof AccountSchema> {
  return {
    accountId: account.accountId,
    email: account.email,
    displayName: account.displayName,
  };
}
