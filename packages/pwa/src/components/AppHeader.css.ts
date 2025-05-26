import {style} from '@vanilla-extract/css';

import {vars} from '@src/lib/theme.css';

export const appHeader = style({
  height: 60,
  paddingInline: vars.spacing[4],
  borderBottom: `solid 1px ${vars.colors.border}`,
  maxWidth: '100%',
  overflow: 'hidden',
});
