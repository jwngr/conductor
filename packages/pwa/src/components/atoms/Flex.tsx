import type {HTMLAttributes} from 'react';

import type {WithChildren} from '@sharedClient/types/utils.client.types';

import * as styles from '@src/components/atoms/Flex.css';
import type {FlexValue as FlexStyleValue} from '@src/components/atoms/Flex.css';

import type {vars} from '@src/lib/theme.css';

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  readonly align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  readonly justify?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  readonly gap?: keyof typeof vars.spacing;
  readonly wrap?: boolean;
  readonly flex?: FlexStyleValue | boolean;
}

interface FlexWithDirectionProps extends FlexProps {
  readonly direction: 'row' | 'column';
  readonly align: Required<FlexProps['align']>;
  readonly justify: Required<FlexProps['justify']>;
}

const FlexWithDirection: React.FC<FlexWithDirectionProps> = ({
  children,
  direction,
  align,
  justify,
  gap,
  wrap,
  flex,
  style,
  ...rest
}) => {
  const flexValue: FlexStyleValue | undefined =
    flex === true ? 1 : flex === false ? 'none' : flex === undefined ? undefined : flex;

  return (
    <div
      className={styles.flex({direction, align, justify, gap, wrap, flexValue})}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
};

export const FlexRow: React.FC<WithChildren<Partial<FlexProps>>> = ({
  align = 'center',
  justify = 'flex-start',
  gap,
  wrap,
  flex,
  children,
  ...rest
}) => {
  return (
    <FlexWithDirection
      direction="row"
      align={align}
      justify={justify}
      gap={gap}
      wrap={wrap}
      flex={flex}
      {...rest}
    >
      {children}
    </FlexWithDirection>
  );
};

export const FlexColumn: React.FC<WithChildren<Partial<FlexProps>>> = ({
  align = 'stretch',
  justify = 'flex-start',
  gap,
  wrap,
  flex,
  children,
  ...rest
}) => {
  return (
    <FlexWithDirection
      direction="column"
      align={align}
      justify={justify}
      gap={gap}
      wrap={wrap}
      flex={flex}
      {...rest}
    >
      {children}
    </FlexWithDirection>
  );
};
