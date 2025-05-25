import {style} from '@vanilla-extract/css';
import {recipe} from '@vanilla-extract/recipes';

import {vars} from '@src/lib/theme.css';

export const storiesScreen = style({
  height: '100%',
  width: '100%',
});

export const storiesLeftSidebar = style({
  height: '100%',
  width: 240,
  borderRight: `1px solid ${vars.colors.neutral[3]}`,
});

export const storiesScreenMainContent = style({
  height: '100%',
});

export const storyGroupSidebarItem = recipe({
  base: {
    cursor: 'pointer',
    padding: vars.spacing[2],
    borderRadius: 4,
  },
  variants: {
    isActive: {
      true: {
        backgroundColor: vars.colors.neutral[2],
        selectors: {
          '&:hover': {
            backgroundColor: vars.colors.neutral[3],
          },
        },
      },
      false: {
        selectors: {
          '&:hover': {
            backgroundColor: vars.colors.neutral[1],
          },
        },
      },
    },
  },
});
