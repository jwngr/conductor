import {recipe} from '@vanilla-extract/recipes';

import {vars} from '@src/lib/theme.css';

export type FlexValue = 1 | 'auto' | 'initial' | 'none';

export const flex = recipe({
  base: {
    display: 'flex',
  },

  variants: {
    gap: {
      0: {gap: 0},
      1: {gap: vars.spacing[1]},
      2: {gap: vars.spacing[2]},
      3: {gap: vars.spacing[3]},
      4: {gap: vars.spacing[4]},
      5: {gap: vars.spacing[5]},
      6: {gap: vars.spacing[6]},
      8: {gap: vars.spacing[8]},
      10: {gap: vars.spacing[10]},
      12: {gap: vars.spacing[12]},
    },
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
