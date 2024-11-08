import {ThemeColor} from '@shared/types/theme.types';

// Colors taken from Tailwind Stone theme: https://tailwindcss.com/docs/customizing-colors.
const neutralColors = {
  [ThemeColor.Neutral50]: '#fafaf9', // Almost white.
  [ThemeColor.Neutral100]: '#f5f5f4',
  [ThemeColor.Neutral200]: '#e7e5e4',
  [ThemeColor.Neutral300]: '#d6d3d1',
  [ThemeColor.Neutral400]: '#a8a29e',
  [ThemeColor.Neutral500]: '#78716c',
  [ThemeColor.Neutral600]: '#57534e',
  [ThemeColor.Neutral700]: '#44403c',
  [ThemeColor.Neutral800]: '#292524',
  [ThemeColor.Neutral900]: '#1c1917',
  [ThemeColor.Neutral950]: '#0c0a09', // Almost black.
} as const;

// Colors taken from Tailwind Red theme: https://tailwindcss.com/docs/customizing-colors.
const redColors = {
  [ThemeColor.Red50]: '#fef2f2',
  [ThemeColor.Red100]: '#fee2e2',
  [ThemeColor.Red200]: '#fecaca',
  [ThemeColor.Red300]: '#fca5a5',
  [ThemeColor.Red400]: '#f87171',
  [ThemeColor.Red500]: '#ef4444',
  [ThemeColor.Red600]: '#dc2626',
  [ThemeColor.Red700]: '#b91c1c',
  [ThemeColor.Red800]: '#991b1b',
  [ThemeColor.Red900]: '#7f1d1d',
  [ThemeColor.Red950]: '#450a0a',
} as const;

// Colors taken from Tailwind Green theme: https://tailwindcss.com/docs/customizing-colors.
const greenColors = {
  [ThemeColor.Green50]: '#f0fdf4',
  [ThemeColor.Green100]: '#dcfce7',
  [ThemeColor.Green200]: '#bbf7d0',
  [ThemeColor.Green300]: '#86efac',
  [ThemeColor.Green400]: '#4ade80',
  [ThemeColor.Green500]: '#22c55e',
  [ThemeColor.Green600]: '#16a34a',
  [ThemeColor.Green700]: '#15803d',
  [ThemeColor.Green800]: '#166534',
  [ThemeColor.Green900]: '#14532d',
  [ThemeColor.Green950]: '#052e16',
} as const;

// Colors taken from Tailwind Blue theme: https://tailwindcss.com/docs/customizing-colors.
const blueColors = {
  [ThemeColor.Blue50]: '#eff6ff',
  [ThemeColor.Blue100]: '#dbeafe',
  [ThemeColor.Blue200]: '#bfdbfe',
  [ThemeColor.Blue300]: '#93c5fd',
  [ThemeColor.Blue400]: '#60a5fa',
  [ThemeColor.Blue500]: '#3b82f6',
  [ThemeColor.Blue600]: '#2563eb',
  [ThemeColor.Blue700]: '#1d4ed8',
  [ThemeColor.Blue800]: '#1e40af',
  [ThemeColor.Blue900]: '#1e3a8a',
  [ThemeColor.Blue950]: '#172554',
} as const;

// Colors taken from Tailwind Orange theme: https://tailwindcss.com/docs/customizing-colors.
const orangeColors = {
  [ThemeColor.Orange50]: '#fff7ed',
  [ThemeColor.Orange100]: '#ffedd5',
  [ThemeColor.Orange200]: '#fed7aa',
  [ThemeColor.Orange300]: '#fdba74',
  [ThemeColor.Orange400]: '#fb923c',
  [ThemeColor.Orange500]: '#f97316',
  [ThemeColor.Orange600]: '#ea580c',
  [ThemeColor.Orange700]: '#c2410c',
  [ThemeColor.Orange800]: '#9a3412',
  [ThemeColor.Orange900]: '#7c2d12',
  [ThemeColor.Orange950]: '#431407',
} as const;

// Colors taken from Tailwind Yellow theme: https://tailwindcss.com/docs/customizing-colors.
const yellowColors = {
  [ThemeColor.Yellow50]: '#fefce8',
  [ThemeColor.Yellow100]: '#fef9c3',
  [ThemeColor.Yellow200]: '#fef08a',
  [ThemeColor.Yellow300]: '#fde047',
  [ThemeColor.Yellow400]: '#facc15',
  [ThemeColor.Yellow500]: '#eab308',
  [ThemeColor.Yellow600]: '#ca8a04',
  [ThemeColor.Yellow700]: '#a16207',
  [ThemeColor.Yellow800]: '#854d0e',
  [ThemeColor.Yellow900]: '#713f12',
  [ThemeColor.Yellow950]: '#422006',
} as const;

export const theme = {
  colors: {
    ...neutralColors,
    ...redColors,
    ...greenColors,
    ...blueColors,
    ...orangeColors,
    ...yellowColors,
  },
} as const;
