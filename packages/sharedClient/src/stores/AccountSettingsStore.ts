import {create} from 'zustand';

import type {AccountSettings} from '@shared/types/accountSettings.types';
import {ThemePreference} from '@shared/types/theme.types';
import type {Consumer, Supplier} from '@shared/types/utils.types';

import type {ClientAccountSettingsService} from '@sharedClient/services/accountSettings.client';

interface AccountSettingsStoreState {
  // State.
  readonly accountSettings: AccountSettings | null;
  readonly accountSettingsService: ClientAccountSettingsService | null;

  // Actions.
  readonly setAccountSettings: Consumer<AccountSettings>;
  readonly setAccountSettingsService: Consumer<ClientAccountSettingsService>;
  readonly resetAccountSettingsStore: Consumer<void>;

  // Getters.
  readonly getThemePreference: Supplier<ThemePreference>;
}

export const useAccountSettingsStore = create<AccountSettingsStoreState>((set, get) => ({
  // Initial state.
  accountSettings: null,
  accountSettingsService: null,

  // Actions.
  setAccountSettings: (accountSettings) => set({accountSettings}),
  setAccountSettingsService: (accountSettingsService) => set({accountSettingsService}),
  resetAccountSettingsStore: () => set({accountSettings: null, accountSettingsService: null}),

  // Getters.
  getThemePreference: (): ThemePreference => {
    const accountSettings = get().accountSettings;
    if (!accountSettings) {
      return ThemePreference.System;
    }

    return accountSettings.themePreference;
  },
}));
