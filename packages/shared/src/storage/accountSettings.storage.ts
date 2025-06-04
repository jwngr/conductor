import {parseStorageTimestamp} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {AccountSettings} from '@shared/types/accountSettings.types';
import type {Result} from '@shared/types/results.types';

import type {AccountSettingsFromStorage} from '@shared/schemas/accountSettings.schema';

/**
 * Converts an {@link AccountSettingsFromStorage} into an {@link AccountSettings}.
 */
export function fromStorageAccountSettings(
  accountSettingsFromStorage: AccountSettingsFromStorage
): Result<AccountSettings> {
  const parsedAccountIdResult = parseAccountId(accountSettingsFromStorage.accountId);
  if (!parsedAccountIdResult.success) return makeErrorResult(parsedAccountIdResult.error);

  return makeSuccessResult({
    accountId: parsedAccountIdResult.value,
    themePreference: accountSettingsFromStorage.themePreference,
    createdTime: parseStorageTimestamp(accountSettingsFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(accountSettingsFromStorage.lastUpdatedTime),
  });
}

/**
 * Converts an {@link AccountSettings} into an {@link AccountSettingsFromStorage}.
 */
export function toStorageAccountSettings(
  accountSettings: AccountSettings
): AccountSettingsFromStorage {
  return {
    accountId: accountSettings.accountId,
    themePreference: accountSettings.themePreference,
    createdTime: accountSettings.createdTime,
    lastUpdatedTime: accountSettings.lastUpdatedTime,
  };
}
