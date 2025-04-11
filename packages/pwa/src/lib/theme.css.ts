import {createTheme, createThemeContract} from '@vanilla-extract/css';

const SHARED_SPACING = {
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
} as const;

const SHARED_RADII = {
  sm: '2px',
  md: '6px',
  lg: '8px',
  full: '9999px',
} as const;

/**
 * Defines the shape of the `vanilla-extract` theme contract, mapping TypeScript keys to CSS
 * variable names. This allows type-safe access to the theme variables defined in `theme.css`.
 */
export const vars = createThemeContract({
  colors: {
    text: null,
    textLight: null,
    textLink: null,
    error: null,
    success: null,
    border: null,
    background: null,
    foreground: null,
    red: {
      '1': null,
      '2': null,
      '3': null,
    },
    green: {
      '1': null,
      '2': null,
      '3': null,
    },
    blue: {
      '1': null,
      '2': null,
      '3': null,
    },
    yellow: {
      '1': null,
      '2': null,
      '3': null,
    },
    purple: {
      '1': null,
      '2': null,
      '3': null,
    },
    orange: {
      '1': null,
      '2': null,
      '3': null,
    },
    neutral: {
      '1': null,
      '2': null,
      '3': null,
      '4': null,
      '5': null,
    },
  },
  spacing: {
    '1': null,
    '2': null,
    '3': null,
    '4': null,
    '5': null,
    '6': null,
    '8': null,
    '10': null,
    '12': null,
  },
  radii: {
    sm: null,
    md: null,
    lg: null,
    full: null,
  },
});

// TODO: Use hex values directly instead of Tailwind CSS variables.
export const lightTheme = createTheme(vars, {
  colors: {
    text: 'var(--color-stone-800)',
    textLight: 'var(--color-stone-500)',
    textLink: 'var(--color-blue-500)',
    error: 'var(--color-red-500)',
    success: 'var(--color-green-500)',
    border: 'var(--color-stone-300)',
    background: 'var(--color-stone-50)',
    foreground: 'var(--color-stone-800)',
    red: {
      '1': 'var(--color-red-300)',
      '2': 'var(--color-red-500)',
      '3': 'var(--color-red-700)',
    },
    green: {
      '1': 'var(--color-green-300)',
      '2': 'var(--color-green-500)',
      '3': 'var(--color-green-700)',
    },
    blue: {
      '1': 'var(--color-blue-300)',
      '2': 'var(--color-blue-500)',
      '3': 'var(--color-blue-700)',
    },
    yellow: {
      '1': 'var(--color-yellow-300)',
      '2': 'var(--color-yellow-500)',
      '3': 'var(--color-yellow-700)',
    },
    purple: {
      '1': 'var(--color-purple-300)',
      '2': 'var(--color-purple-500)',
      '3': 'var(--color-purple-700)',
    },
    orange: {
      '1': 'var(--color-orange-300)',
      '2': 'var(--color-orange-500)',
      '3': 'var(--color-orange-700)',
    },
    neutral: {
      '1': 'var(--color-neutral-100)',
      '2': 'var(--color-neutral-300)',
      '3': 'var(--color-neutral-500)',
      '4': 'var(--color-neutral-700)',
      '5': 'var(--color-neutral-900)',
    },
  },
  spacing: SHARED_SPACING,
  radii: SHARED_RADII,
});

export const darkTheme = createTheme(vars, {
  colors: {
    text: 'var(--color-stone-50)',
    textLight: 'var(--color-stone-400)',
    textLink: 'var(--color-blue-100)',
    error: 'var(--color-red-400)',
    success: 'var(--color-green-400)',
    border: 'var(--color-stone-300)',
    background: 'var(--color-stone-900)',
    foreground: 'var(--color-stone-50)',
    red: {
      '1': 'var(--color-red-700)',
      '2': 'var(--color-red-900)',
      '3': 'var(--color-red-950)',
    },
    green: {
      '1': 'var(--color-green-700)',
      '2': 'var(--color-green-900)',
      '3': 'var(--color-green-950)',
    },
    blue: {
      '1': 'var(--color-blue-700)',
      '2': 'var(--color-blue-900)',
      '3': 'var(--color-blue-950)',
    },
    yellow: {
      '1': 'var(--color-yellow-700)',
      '2': 'var(--color-yellow-900)',
      '3': 'var(--color-yellow-950)',
    },
    purple: {
      '1': 'var(--color-purple-700)',
      '2': 'var(--color-purple-900)',
      '3': 'var(--color-purple-950)',
    },
    orange: {
      '1': 'var(--color-orange-700)',
      '2': 'var(--color-orange-900)',
      '3': 'var(--color-orange-950)',
    },
    neutral: {
      '1': 'var(--color-neutral-500)',
      '2': 'var(--color-neutral-700)',
      '3': 'var(--color-neutral-800)',
      '4': 'var(--color-neutral-900)',
      '5': 'var(--color-neutral-950)',
    },
  },
  spacing: SHARED_SPACING,
  radii: SHARED_RADII,
});
