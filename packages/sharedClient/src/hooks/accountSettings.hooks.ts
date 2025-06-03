import {useMemo} from 'react';

import type {ThemePreference} from '@shared/types/theme.types';

import {useAccountSettingsStore} from '@sharedClient/stores/AccountSettingsStore';

export function useThemePreference(): ThemePreference {
  return useAccountSettingsStore((state) => state.getThemePreference());
}
