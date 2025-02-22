import type {HTMLAttributes} from 'react';
import styled, {css} from 'styled-components';

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

interface FlexWrapperProps {
  readonly $mobileGap?: number;
  readonly $desktopGap?: number;
}

const FlexWrapper = styled.div<FlexWrapperProps>`
  ${({$desktopGap}) =>
    typeof $desktopGap === 'undefined'
      ? null
      : css`
          gap: calc(${$desktopGap * 1}px);
        `};

  ${({$mobileGap}) =>
    typeof $mobileGap === 'undefined'
      ? null
      : css`
          @media (max-width: 768px) {
            gap: calc(${$mobileGap * 1}px);
          }
        `};
`;

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
  const mobileGap = typeof gap === 'number' ? gap : gap?.mobile;
  const desktopGap = typeof gap === 'number' ? gap : gap?.desktop;

  const flexValue = flex === true ? 1 : flex === false ? 0 : flex;
  const wrapValue = wrap === true ? 'wrap' : wrap === false ? 'nowrap' : undefined;

  return (
    <FlexWrapper
      $mobileGap={mobileGap}
      $desktopGap={desktopGap}
      style={{
        ...style,
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        ...(typeof flexValue === 'undefined' ? {} : {flex: flexValue}),
        ...(typeof wrapValue === 'undefined' ? {} : {flexWrap: wrapValue}),
      }}
      {...rest}
    >
      {children}
    </FlexWrapper>
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
