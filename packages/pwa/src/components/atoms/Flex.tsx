import type {HTMLAttributes} from 'react';

import type {
  FlexAlign,
  FlexGap,
  FlexJustify,
  FlexOverflow,
  FlexValue,
} from '@shared/types/flex.types';
import type {ThemeSpacing} from '@shared/types/theme.types';

import type {WithChildren} from '@sharedClient/types/utils.client.types';

import * as styles from '@src/components/atoms/Flex.css';

import {cn} from '@src/lib/utils.pwa';

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  readonly align?: FlexAlign;
  readonly justify?: FlexJustify;
  readonly gap?: FlexGap;
  readonly wrap?: boolean;
  readonly flex?: FlexValue | boolean;
  readonly overflow?: FlexOverflow;
  readonly padding?: ThemeSpacing;
}

export const FlexRow: React.FC<WithChildren<Partial<FlexProps>>> = (props) => {
  const {align, justify, gap, wrap, flex, overflow, padding, children, className, ...rest} = props;

  return (
    <div
      className={cn(
        styles.flex({
          direction: 'row',
          align: align ?? 'center',
          justify: justify ?? 'start',
          flexValue: flex,
          gap,
          wrap,
          overflow,
          padding,
        }),
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const FlexColumn: React.FC<WithChildren<Partial<FlexProps>>> = (props) => {
  const {align, justify, gap, wrap, flex, overflow, padding, children, className, ...rest} = props;

  return (
    <div
      className={cn(
        styles.flex({
          direction: 'column',
          align: align ?? 'stretch',
          justify: justify ?? 'start',
          flexValue: flex,
          gap,
          wrap,
          overflow,
          padding,
        }),
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
