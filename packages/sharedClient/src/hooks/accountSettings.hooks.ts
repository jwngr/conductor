import {useMemo} from 'react';

import type {ThemePreference} from '@shared/types/theme.types';

import {useAccountSettingsStore} from '@sharedClient/stores/AccountSettingsStore';

export function useThemePreference(): ThemePreference {
  const getThemePreference = useAccountSettingsStore((state) => state.getThemePreference);
  return useMemo(() => getThemePreference(), [getThemePreference]);
}
