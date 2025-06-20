import {style} from '@vanilla-extract/css';
import {recipe} from '@vanilla-extract/recipes';

import {vars} from '@src/lib/theme.css';

export const topBar = style({
  height: 60,
  paddingInline: vars.spacing[4],
  borderBottom: `solid 1px ${vars.colors.border}`,
  maxWidth: '100%',
  overflow: 'hidden',
});

export const navItemWithCountWrapper = recipe({
  base: {
    position: 'relative',
    borderRadius: 12,
    padding: '4px 16px',
    color: vars.colors.text,
  },
  variants: {
    selected: {
      true: {
        background: vars.colors.orange[2],
      },
      false: {
        background: 'transparent',
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});
