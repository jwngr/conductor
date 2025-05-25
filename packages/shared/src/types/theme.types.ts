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

export const DEFAULT_TEXT_COLOR = 'text-text-default';
export const DEFAULT_TEXT_LIGHT_COLOR = 'text-text-light';

export const DEFAULT_ICON_COLOR = 'text-text-default';

export type ThemeSpacing = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
