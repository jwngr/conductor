import {style} from '@vanilla-extract/css';
import {recipe} from '@vanilla-extract/recipes';

import {vars} from '@src/lib/theme.css';

const hoverStyles = style({
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.neutral[1],
    },
    '&:focus-visible': {
      backgroundColor: vars.colors.neutral[1],
    },
  },
});

export const viewListItem = recipe({
  base: [
    {
      position: 'relative',
      padding: 8,
      // Negative margin to offset padding and keep text left-aligned.
      margin: -8,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 4,
      borderRadius: 4,
      outline: 'none',
      cursor: 'pointer',
    },
    hoverStyles,
  ],
  variants: {
    isFocused: {
      true: {
        backgroundColor: vars.colors.neutral[1],
        outline: `2px solid ${vars.colors.neutral[3]}`,
      },
    },
  },
});

export const viewListItemActions = recipe({
  base: {
    position: 'absolute',
    top: '50%',
    right: 8,
    transform: 'translateY(-50%)',
  },
});
