import {assignVars, createThemeContract, style} from '@vanilla-extract/css';
import {recipe} from '@vanilla-extract/recipes';

export type FlexValue = 1 | 'auto' | 'initial' | 'none';

export const flexVars = createThemeContract({
  mobileGap: null,
  desktopGap: null,
});

const DEFAULT_GAP = {
  mobileGap: '0px',
  desktopGap: '0px',
} as const;

export const flex = recipe({
  base: {
    display: 'flex',
    vars: assignVars(flexVars, DEFAULT_GAP),
    gap: flexVars.mobileGap,
    '@media': {
      '(max-width: 768px)': {
        gap: flexVars.desktopGap,
      },
    },
  },

  variants: {
    direction: {
      row: {flexDirection: 'row'},
      column: {flexDirection: 'column'},
    },
    align: {
      'flex-start': {alignItems: 'flex-start'},
      'flex-end': {alignItems: 'flex-end'},
      center: {alignItems: 'center'},
      stretch: {alignItems: 'stretch'},
      baseline: {alignItems: 'baseline'},
    },
    justify: {
      'flex-start': {justifyContent: 'flex-start'},
      'flex-end': {justifyContent: 'flex-end'},
      center: {justifyContent: 'center'},
      'space-between': {justifyContent: 'space-between'},
      'space-around': {justifyContent: 'space-around'},
      'space-evenly': {justifyContent: 'space-evenly'},
    },
    wrap: {
      true: {flexWrap: 'wrap'},
      false: {flexWrap: 'nowrap'},
    },
    flexValue: {
      1: {flex: 1},
      auto: {flex: 'auto'},
      initial: {flex: 'initial'},
      none: {flex: 'none'},
    },
  },
});

export const assignResponsiveGap = (
  gap: number | {mobile: number; desktop: number}
): ReturnType<typeof style> => {
  if (typeof gap === 'number') {
    return style({
      vars: assignVars(flexVars, {mobileGap: `${gap}px`, desktopGap: `${gap}px`}),
    });
  }

  console.log('gap', gap);

  return style({
    vars: assignVars(flexVars, {mobileGap: `${gap.mobile}px`, desktopGap: `${gap.desktop}px`}),
    '@media': {
      '(max-width: 768px)': {
        vars: assignVars(flexVars, {mobileGap: `${gap.mobile}px`, desktopGap: `${gap.desktop}px`}),
      },
    },
  });
};
