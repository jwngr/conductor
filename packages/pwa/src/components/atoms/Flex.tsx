import type {HTMLAttributes} from 'react';

import * as styles from '@src/components/atoms/Flex.css';
import type {FlexValue as FlexStyleValue} from '@src/components/atoms/Flex.css';

import type {vars} from '@src/lib/theme.css';

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  readonly direction: 'row' | 'column';
  readonly align: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  readonly justify:
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

const Flex: React.FC<FlexProps> = ({
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
  const flexStyleValue: FlexStyleValue | undefined =
    flex === true ? 1 : flex === false ? 'none' : flex === undefined ? undefined : flex;

  return (
    <div
      className={styles.flex({
        direction,
        align,
        justify,
        gap,
        wrap: wrap,
        flexValue: flexStyleValue,
      })}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
};

type FlexRowColumnProps = Partial<Omit<FlexProps, 'direction'> & {gap: FlexProps['gap']}> & {
  readonly children: React.ReactNode;
};

export const FlexRow: React.FC<FlexRowColumnProps> = ({
  align = 'center',
  justify = 'flex-start',
  gap,
  wrap,
  flex,
  children,
  ...rest
}) => {
  return (
    <Flex
      direction="row"
      align={align}
      justify={justify}
      gap={gap}
      wrap={wrap}
      flex={flex}
      {...rest}
    >
      {children}
    </Flex>
  );
};

export const FlexColumn: React.FC<FlexRowColumnProps> = ({
  align = 'stretch',
  justify = 'flex-start',
  gap,
  wrap,
  flex,
  children,
  ...rest
}) => {
  return (
    <Flex
      direction="column"
      align={align}
      justify={justify}
      gap={gap}
      wrap={wrap}
      flex={flex}
      {...rest}
    >
      {children}
    </Flex>
  );
};
