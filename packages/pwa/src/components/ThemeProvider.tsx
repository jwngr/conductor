import type {ReactNode} from 'react';
import {createContext, useContext, useEffect, useState} from 'react';

import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {Result} from '@shared/types/result.types';
import {DEFAULT_THEME_PREFERENCE, ThemePreference} from '@shared/types/theme.types';
import type {Consumer} from '@shared/types/utils.types';

import type {WithChildren} from '@sharedClient/types/utils.client.types';

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
  // This attribute is currently not used by anything, but is best practice to set.
  window.document.body.setAttribute('data-theme', themeType);

  // This class is used by Tailwind to apply the correct theme.
  if (themeType === 'dark') {
    window.document.body.classList.add('dark');
  } else {
    window.document.body.classList.remove('dark');
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
