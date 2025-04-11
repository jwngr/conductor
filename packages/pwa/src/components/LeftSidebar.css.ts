import {style} from '@vanilla-extract/css';

import {vars} from '@src/lib/theme.css';

export const sidebarWrapper = style({
  backgroundColor: vars.colors.neutral[1],
  borderColor: vars.colors.neutral[2],
  borderRightWidth: 1,
  width: 200,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[4],
  overflow: 'auto',
  padding: vars.spacing[5],
});

export const sidebarSectionWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
});

export const sidebarSectionItemsWrapper = style({
  display: 'flex',
  flexDirection: 'column',
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

export const sidebarItemDiv = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: vars.spacing[2],
});
