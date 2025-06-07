import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {AccountSettings} from '@shared/types/accountSettings.types';
import type {Result} from '@shared/types/results.types';

import {AccountSettingsSchema} from '@shared/schemas/accountSettings.schema';
import {fromStorageAccountSettings} from '@shared/storage/accountSettings.storage';

/**
 * Attempts to parse an unknown value into an {@link AccountSettings}.
 */
export function parseAccountSettings(
  maybeAccountSettings: unknown
): Result<AccountSettings, Error> {
  const parsedResult = parseZodResult(AccountSettingsSchema, maybeAccountSettings);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid account settings');
  }

  const accountSettingsFromStorage = parsedResult.value;
  return fromStorageAccountSettings(accountSettingsFromStorage);
}
