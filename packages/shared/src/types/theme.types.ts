/**
 * User preference for the application theme. System will use the browser's "prefers color scheme"
 * setting.
 */
export enum ThemePreference {
  System = 'SYSTEM',
  Light = 'LIGHT',
  Dark = 'DARK',
}

export const DEFAULT_THEME_PREFERENCE = ThemePreference.System;
