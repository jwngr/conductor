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
    background2: null,
    foreground: null,
    red: {
      '1': null,
      '2': null,
    },
    green: {
      '1': null,
      '2': null,
    },
    blue: {
      '1': null,
      '2': null,
    },
    yellow: {
      '1': null,
      '2': null,
    },
    purple: {
      '1': null,
      '2': null,
    },
    orange: {
      '1': null,
      '2': null,
    },
    cyan: {
      '1': null,
      '2': null,
    },
    magenta: {
      '1': null,
      '2': null,
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

export const lightTheme = createTheme(vars, {
  colors: {
    text: 'var(--color-text)',
    textLight: 'var(--color-text-light)',
    textLink: 'var(--color-text-link)',
    error: 'var(--color-error)',
    success: 'var(--color-success)',
    border: 'var(--color-border)',
    background: 'var(--color-background)',
    background2: 'var(--color-background-2)',
    foreground: 'var(--color-foreground)',
    red: {
      '1': 'var(--color-red-1)',
      '2': 'var(--color-red-2)',
    },
    green: {
      '1': 'var(--color-green-1)',
      '2': 'var(--color-green-2)',
    },
    blue: {
      '1': 'var(--color-blue-1)',
      '2': 'var(--color-blue-2)',
    },
    yellow: {
      '1': 'var(--color-yellow-1)',
      '2': 'var(--color-yellow-2)',
    },
    purple: {
      '1': 'var(--color-purple-1)',
      '2': 'var(--color-purple-2)',
    },
    orange: {
      '1': 'var(--color-orange-1)',
      '2': 'var(--color-orange-2)',
    },
    cyan: {
      '1': 'var(--color-cyan-1)',
      '2': 'var(--color-cyan-2)',
    },
    magenta: {
      '1': 'var(--color-magenta-1)',
      '2': 'var(--color-magenta-2)',
    },
    neutral: {
      '1': 'var(--color-neutral-1)',
      '2': 'var(--color-neutral-2)',
      '3': 'var(--color-neutral-3)',
      '4': 'var(--color-neutral-4)',
      '5': 'var(--color-neutral-5)',
    },
  },
  spacing: SHARED_SPACING,
  radii: SHARED_RADII,
});

export const darkTheme = createTheme(vars, {
  colors: {
    text: 'var(--color-text)',
    textLight: 'var(--color-text-light)',
    textLink: 'var(--color-text-link)',
    error: 'var(--color-error)',
    success: 'var(--color-success)',
    border: 'var(--color-border)',
    background: 'var(--color-background)',
    background2: 'var(--color-background-2)',
    foreground: 'var(--color-foreground)',
    red: {
      '1': 'var(--color-red-1)',
      '2': 'var(--color-red-2)',
    },
    green: {
      '1': 'var(--color-green-1)',
      '2': 'var(--color-green-2)',
    },
    blue: {
      '1': 'var(--color-blue-1)',
      '2': 'var(--color-blue-2)',
    },
    yellow: {
      '1': 'var(--color-yellow-1)',
      '2': 'var(--color-yellow-2)',
    },
    purple: {
      '1': 'var(--color-purple-1)',
      '2': 'var(--color-purple-2)',
    },
    orange: {
      '1': 'var(--color-orange-1)',
      '2': 'var(--color-orange-2)',
    },
    cyan: {
      '1': 'var(--color-cyan-1)',
      '2': 'var(--color-cyan-2)',
    },
    magenta: {
      '1': 'var(--color-magenta-1)',
      '2': 'var(--color-magenta-2)',
    },
    neutral: {
      '1': 'var(--color-neutral-1)',
      '2': 'var(--color-neutral-2)',
      '3': 'var(--color-neutral-3)',
      '4': 'var(--color-neutral-4)',
      '5': 'var(--color-neutral-5)',
    },
  },
  spacing: SHARED_SPACING,
  radii: SHARED_RADII,
});
