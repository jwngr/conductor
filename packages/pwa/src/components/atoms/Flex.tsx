import type {HTMLAttributes} from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {cn} from '@src/lib/utils';

export type FlexValue = 1 | 'auto' | 'initial' | 'none' | boolean;

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
  readonly flex?: FlexValue;
}

function getFlexClasses(args: {
  readonly direction: FlexProps['direction'];
  readonly align: FlexProps['align'];
  readonly justify: FlexProps['justify'];
  readonly wrap?: FlexProps['wrap'];
  readonly flex?: FlexProps['flex'];
  readonly gap?: FlexProps['gap'];
}): string {
  const {direction, align, justify, wrap, flex, gap} = args;

  const flexClasses = (() => {
    if (flex === true) return 'flex-1';
    if (flex === false) return 'flex-none';
    if (typeof flex === 'number') return `flex-[${flex}]`;
    return flex ? `flex-[${flex}]` : '';
  })();

  const gapClasses = (() => {
    if (!gap) return '';
    if (typeof gap === 'number') return `gap-${gap / 4}`;
    return `md:gap-${gap.desktop / 4} gap-${gap.mobile / 4}`;
  })();

  const alignClasses = (() => {
    switch (align) {
      case 'flex-start':
        return 'items-start';
      case 'flex-end':
        return 'items-end';
      case 'center':
        return 'items-center';
      case 'stretch':
        return 'items-stretch';
      case 'baseline':
        return 'items-baseline';
      default:
        assertNever(align);
    }
  })();

  const justifyClasses = (() => {
    switch (justify) {
      case 'flex-start':
        return 'justify-start';
      case 'flex-end':
        return 'justify-end';
      case 'center':
        return 'justify-center';
      case 'space-between':
        return 'justify-between';
      case 'space-around':
        return 'justify-around';
      case 'space-evenly':
        return 'justify-evenly';
      default:
        assertNever(justify);
    }
  })();

  return cn(
    'flex',
    direction === 'row' ? 'flex-row' : 'flex-col',
    alignClasses,
    justifyClasses,
    wrap ? 'flex-wrap' : '',
    flexClasses,
    gapClasses
  );
}

const Flex: React.FC<FlexProps> = ({
  children,
  direction,
  align,
  justify,
  gap,
  wrap,
  flex,
  className,
  ...rest
}) => {
  return (
    <div
      className={cn(getFlexClasses({direction, align, justify, wrap, flex, gap}), className)}
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
  className,
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
      className={className}
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
  className,
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
      className={className}
      {...rest}
    >
      {children}
    </Flex>
  );
};
