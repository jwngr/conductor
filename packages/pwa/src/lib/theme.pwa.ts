import {logger} from '@shared/services/logger.shared';

import {assertNever} from '@shared/lib/utils.shared';

import {ThemePreference} from '@shared/types/theme.types';

import type {BrowserPrefersColorScheme} from '@src/types/theme.pwa.types';

/** Key used to store the user's theme preference in local storage. */
export const THEME_PREFERENCE_STORAGE_KEY = 'theme-preference';

/**
 * Maps a {@link ThemePreference} to a valid browser "prefers color scheme" value.
 */
export function toPrefersColorScheme(themeType: ThemePreference): BrowserPrefersColorScheme {
  switch (themeType) {
    case ThemePreference.System:
      return getSystemThemeFromWindow();
    case ThemePreference.Light:
      return 'light';
    case ThemePreference.Dark:
      return 'dark';
    default:
      assertNever(themeType);
  }
}

/**
 * Returns the system theme from the browser's "prefers color scheme" setting.
 */
export function getSystemThemeFromWindow(): BrowserPrefersColorScheme {
  const matchesDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return matchesDarkMode ? 'dark' : 'light';
}

export function getThemePreferenceFromLocalStorage(): ThemePreference | null {
  const stored = localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
  const trimmedAndLowerCased = stored?.trim().toLowerCase();
  if (!trimmedAndLowerCased) return null;

  switch (trimmedAndLowerCased) {
    case 'system':
      return ThemePreference.System;
    case 'light':
      return ThemePreference.Light;
    case 'dark':
      return ThemePreference.Dark;
    default:
      logger.warn('Local storage contains unexpected theme preference', {stored, trimmed});
      return null;
  }
}
