import type {HTMLAttributes} from 'react';

import * as styles from '@src/components/atoms/Flex.css';
import type {FlexValue as FlexStyleValue} from '@src/components/atoms/Flex.css';
import {assignResponsiveGap} from '@src/components/atoms/Flex.css';

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
  readonly gap?: number | {mobile: number; desktop: number};
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

  const gapStyle = gap ? assignResponsiveGap(gap) : {};

  const mobileGap = typeof gap === 'object' ? gap.mobile : (gap ?? 0);
  const desktopGap = typeof gap === 'object' ? gap.desktop : (gap ?? 0);

  return (
    <div
      className={styles.flex({
        direction,
        align,
        justify,
        wrap: wrap,
        flexValue: flexStyleValue,
      })}
      style={{
        ...style,
        // ...assignVars(flexVars, {
        //   mobileGap: `${mobileGap}px`,
        //   desktopGap: `${desktopGap}px`,
        // }),
        ...gapStyle,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

type FlexRowColumnProps = Partial<Omit<FlexProps, 'direction'>> & {
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
