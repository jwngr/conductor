import type {ReactNode} from 'react';
import {createContext, useContext, useEffect, useState} from 'react';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';
import {DEFAULT_THEME_PREFERENCE, ThemePreference} from '@shared/types/theme.types';
import type {Consumer} from '@shared/types/utils.types';

import type {WithChildren} from '@sharedClient/types/utils.client.types';

import {darkTheme, lightTheme} from '@src/lib/theme.css';
import {
  getThemePreferenceFromLocalStorage,
  THEME_PREFERENCE_STORAGE_KEY,
  toPrefersColorScheme,
} from '@src/lib/theme.pwa';

import type {BrowserPrefersColorScheme} from '@src/types/theme.pwa.types';

interface ThemeContextType {
  readonly themePreference: ThemePreference;
  readonly setThemePreference: Consumer<ThemePreference>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function updateBodyOnNewThemePreference(themeType: BrowserPrefersColorScheme): void {
  const bodyClassList = window.document.body.classList;

  // Set data-theme attribute (optional, but good practice).
  window.document.body.setAttribute('data-theme', themeType);

  const isDark = themeType === 'dark';

  // vanilla-extract
  bodyClassList.remove(isDark ? lightTheme : darkTheme);
  bodyClassList.add(isDark ? darkTheme : lightTheme);

  // Tailwind
  if (themeType === 'dark') {
    bodyClassList.add('dark');
  } else {
    bodyClassList.remove('dark');
  }
}

export function ThemeProvider({children}: WithChildren): ReactNode {
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    return getThemePreferenceFromLocalStorage() ?? DEFAULT_THEME_PREFERENCE;
  });

  /**
   * Handler called on mount and whenever the user manually changes the theme setting.
   */
  useEffect(() => {
    updateBodyOnNewThemePreference(toPrefersColorScheme(themePreference));
    localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, themePreference);
  }, [themePreference]);

  /**
   * Handler called when the system theme changes, either manually or automatically at some point in
   * the day.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent): void => {
      // Only auto-update body if user preference is "System".
      if (themePreference !== ThemePreference.System) return;

      const prefersColorScheme: BrowserPrefersColorScheme = event.matches ? 'dark' : 'light';
      updateBodyOnNewThemePreference(prefersColorScheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  return (
    <ThemeContext.Provider value={{themePreference, setThemePreference}}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Result<ThemeContextType> {
  const context = useContext(ThemeContext);
  if (!context) {
    return makeErrorResult(new Error('useTheme must be used within a ThemeProvider'));
  }
  return makeSuccessResult(context);
}
