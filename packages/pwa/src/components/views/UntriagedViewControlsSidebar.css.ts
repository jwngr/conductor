import {style} from '@vanilla-extract/css';

import {vars} from '@src/lib/theme.css';

export const controlsSidebarWrapper = style({
  width: 200,
  padding: vars.spacing[4],
  height: '100%',
  backgroundColor: vars.colors.neutral[1],
  borderRight: `solid 1px ${vars.colors.neutral[2]}`,
});
