import {style} from '@vanilla-extract/css';

import {vars} from '@src/lib/theme.css';

export const sidebarWrapper = style({
  width: 200,
  backgroundColor: vars.colors.neutral[1],
  borderRight: `solid 1px ${vars.colors.neutral[2]}`,
});

export const sidebarItemLink = style({
  borderRadius: vars.radii.md,
  paddingBlock: vars.spacing[2],
  paddingInline: vars.spacing[3],
  selectors: {
    '&.active': {
      backgroundColor: vars.colors.orange[1],
    },
    '&:hover': {
      backgroundColor: vars.colors.neutral[3],
    },
    '&.active:hover': {
      backgroundColor: vars.colors.orange[2],
    },
  },
});
