import {recipe} from '@vanilla-extract/recipes';

import {vars} from '@src/lib/theme.css';

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
      start: {alignItems: 'flex-start'},
      end: {alignItems: 'flex-end'},
      center: {alignItems: 'center'},
      stretch: {alignItems: 'stretch'},
      baseline: {alignItems: 'baseline'},
    },
    justify: {
      start: {justifyContent: 'flex-start'},
      end: {justifyContent: 'flex-end'},
      center: {justifyContent: 'center'},
      between: {justifyContent: 'space-between'},
      around: {justifyContent: 'space-around'},
      evenly: {justifyContent: 'space-evenly'},
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
    overflow: {
      auto: {overflow: 'auto'},
      clip: {overflow: 'clip'},
      hidden: {overflow: 'hidden'},
      scroll: {overflow: 'scroll'},
      visible: {overflow: 'visible'},
    },
    padding: {
      0: {padding: 0},
      1: {padding: vars.spacing[1]},
      2: {padding: vars.spacing[2]},
      3: {padding: vars.spacing[3]},
      4: {padding: vars.spacing[4]},
      5: {padding: vars.spacing[5]},
      6: {padding: vars.spacing[6]},
      8: {padding: vars.spacing[8]},
      10: {padding: vars.spacing[10]},
      12: {padding: vars.spacing[12]},
    },
  },
});
