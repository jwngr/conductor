import type {AccountSettings} from '@shared/types/accountSettings.types';
import type {AccountId} from '@shared/types/ids.types';
import {DEFAULT_THEME_PREFERENCE} from '@shared/types/theme.types';

export function makeDefaultAccountSettings(args: {readonly accountId: AccountId}): AccountSettings {
  const {accountId} = args;

  return {
    accountId,
    themePreference: DEFAULT_THEME_PREFERENCE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}
