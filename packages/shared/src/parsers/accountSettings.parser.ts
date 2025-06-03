import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {AccountSettings} from '@shared/types/accountSettings.types';
import type {Result} from '@shared/types/results.types';

import {AccountSettingsSchema} from '@shared/schemas/accountSettings.schema';
import type {AccountSettingsFromStorage} from '@shared/schemas/accountSettings.schema';

/**
 * Parses {@link AccountSettings} from an unknown value. Returns an `ErrorResult` if the value is not
 * valid.
 */
export function parseAccountSettings(maybeAccountSettings: unknown): Result<AccountSettings> {
  const parsedResult = parseZodResult(AccountSettingsSchema, maybeAccountSettings);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid account settings');
  }

  const parsedAccountIdResult = parseAccountId(parsedResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  return makeSuccessResult(
    omitUndefined({
      accountId: parsedAccountIdResult.value,
      themePreference: parsedResult.value.themePreference,
      createdTime: parseStorageTimestamp(parsedResult.value.createdTime),
      lastUpdatedTime: parseStorageTimestamp(parsedResult.value.lastUpdatedTime),
    })
  );
}

/**
 * Converts {@link AccountSettings} to an {@link AccountSettingsFromStorage} object that can be persisted to
 * Firestore.
 */
export function toStorageAccountSettings(
  accountSettings: AccountSettings
): AccountSettingsFromStorage {
  return omitUndefined({
    accountId: accountSettings.accountId,
    themePreference: accountSettings.themePreference,
    createdTime: accountSettings.createdTime,
    lastUpdatedTime: accountSettings.lastUpdatedTime,
  });
}
