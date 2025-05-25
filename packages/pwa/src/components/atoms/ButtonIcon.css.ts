import {style, styleVariants} from '@vanilla-extract/css';

import {vars} from '@src/lib/theme.css';

export const buttonIconWrapper = style({
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radii.md,
  color: vars.colors.neutral[5],
  backgroundColor: vars.colors.neutral[1],
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.neutral[3],
    },
  },
});

export const buttonIconSize = styleVariants({
  24: {
    height: vars.spacing[6],
    width: vars.spacing[6],
  },
  32: {
    height: vars.spacing[8],
    width: vars.spacing[8],
  },
  40: {
    height: vars.spacing[10],
    width: vars.spacing[10],
  },
});
