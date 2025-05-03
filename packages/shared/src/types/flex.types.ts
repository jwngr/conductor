import type {ThemeSpacing} from '@shared/types/theme.types';

export type FlexValue = 1 | 'auto' | 'initial' | 'none';

export type FlexAlign = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

export type FlexJustify =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export type FlexGap = ThemeSpacing;

export type FlexOverflow = 'auto' | 'clip' | 'hidden' | 'scroll' | 'visible';
