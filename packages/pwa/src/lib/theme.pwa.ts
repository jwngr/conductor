import {logger} from '@shared/services/logger.shared';

import {assertNever} from '@shared/lib/utils.shared';

import {ThemeColor, ThemePreference} from '@shared/types/theme.types';

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
  const trimmed = stored?.trim();
  if (!trimmed) return null;

  switch (trimmed) {
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

/**
 * Maps a {@link ThemeColor} to a Tailwind class name.
 *
 * @deprecated TODO: Get rid of this.
 */
export function getThemeColorClass(color: ThemeColor): string {
  switch (color) {
    case ThemeColor.Neutral50:
      return 'text-stone-50';
    case ThemeColor.Neutral100:
      return 'text-stone-100';
    case ThemeColor.Neutral200:
      return 'text-stone-200';
    case ThemeColor.Neutral300:
      return 'text-stone-300';
    case ThemeColor.Neutral400:
      return 'text-stone-400';
    case ThemeColor.Neutral500:
      return 'text-stone-500';
    case ThemeColor.Neutral600:
      return 'text-stone-600';
    case ThemeColor.Neutral700:
      return 'text-stone-700';
    case ThemeColor.Neutral800:
      return 'text-stone-800';
    case ThemeColor.Neutral900:
      return 'text-stone-900';
    case ThemeColor.Neutral950:
      return 'text-stone-950';
    case ThemeColor.Red50:
      return 'text-red-50';
    case ThemeColor.Red100:
      return 'text-red-100';
    case ThemeColor.Red200:
      return 'text-red-200';
    case ThemeColor.Red300:
      return 'text-red-300';
    case ThemeColor.Red400:
      return 'text-red-400';
    case ThemeColor.Red500:
      return 'text-red-500';
    case ThemeColor.Red600:
      return 'text-red-600';
    case ThemeColor.Red700:
      return 'text-red-700';
    case ThemeColor.Red800:
      return 'text-red-800';
    case ThemeColor.Red900:
      return 'text-red-900';
    case ThemeColor.Red950:
      return 'text-red-950';
    case ThemeColor.Green50:
      return 'text-green-50';
    case ThemeColor.Green100:
      return 'text-green-100';
    case ThemeColor.Green200:
      return 'text-green-200';
    case ThemeColor.Green300:
      return 'text-green-300';
    case ThemeColor.Green400:
      return 'text-green-400';
    case ThemeColor.Green500:
      return 'text-green-500';
    case ThemeColor.Green600:
      return 'text-green-600';
    case ThemeColor.Green700:
      return 'text-green-700';
    case ThemeColor.Green800:
      return 'text-green-800';
    case ThemeColor.Green900:
      return 'text-green-900';
    case ThemeColor.Green950:
      return 'text-green-950';
    case ThemeColor.Blue50:
      return 'text-blue-50';
    case ThemeColor.Blue100:
      return 'text-blue-100';
    case ThemeColor.Blue200:
      return 'text-blue-200';
    case ThemeColor.Blue300:
      return 'text-blue-300';
    case ThemeColor.Blue400:
      return 'text-blue-400';
    case ThemeColor.Blue500:
      return 'text-blue-500';
    case ThemeColor.Blue600:
      return 'text-blue-600';
    case ThemeColor.Blue700:
      return 'text-blue-700';
    case ThemeColor.Blue800:
      return 'text-blue-800';
    case ThemeColor.Blue900:
      return 'text-blue-900';
    case ThemeColor.Blue950:
      return 'text-blue-950';
    case ThemeColor.Orange50:
      return 'text-orange-50';
    case ThemeColor.Orange100:
      return 'text-orange-100';
    case ThemeColor.Orange200:
      return 'text-orange-200';
    case ThemeColor.Orange300:
      return 'text-orange-300';
    case ThemeColor.Orange400:
      return 'text-orange-400';
    case ThemeColor.Orange500:
      return 'text-orange-500';
    case ThemeColor.Orange600:
      return 'text-orange-600';
    case ThemeColor.Orange700:
      return 'text-orange-700';
    case ThemeColor.Orange800:
      return 'text-orange-800';
    case ThemeColor.Orange900:
      return 'text-orange-900';
    case ThemeColor.Orange950:
      return 'text-orange-950';
    case ThemeColor.Yellow50:
      return 'text-yellow-50';
    case ThemeColor.Yellow100:
      return 'text-yellow-100';
    case ThemeColor.Yellow200:
      return 'text-yellow-200';
    case ThemeColor.Yellow300:
      return 'text-yellow-300';
    case ThemeColor.Yellow400:
      return 'text-yellow-400';
    case ThemeColor.Yellow500:
      return 'text-yellow-500';
    case ThemeColor.Yellow600:
      return 'text-yellow-600';
    case ThemeColor.Yellow700:
      return 'text-yellow-700';
    case ThemeColor.Yellow800:
      return 'text-yellow-800';
    case ThemeColor.Yellow900:
      return 'text-yellow-900';
    case ThemeColor.Yellow950:
      return 'text-yellow-950';
    default:
      assertNever(color);
  }
}
