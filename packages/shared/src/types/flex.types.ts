import type {ThemeSpacing} from '@shared/types/theme.types';

export type FlexValue = true | false | 'auto' | 'initial';

export type FlexAlign = 'start' | 'end' | 'center' | 'stretch' | 'baseline';

export type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

export type FlexGap = ThemeSpacing;

export type FlexOverflow = 'auto' | 'clip' | 'hidden' | 'scroll' | 'visible';
