import {HTMLAttributes} from 'react';
import styled from 'styled-components';

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  readonly direction: 'row' | 'column';
  readonly gap: number | {mobile: number; desktop: number};
  readonly wrap: boolean;
  readonly align: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  readonly justify:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  readonly flex: string | number | boolean;
}

interface FlexWrapperProps {
  readonly $mobileGap: number;
  readonly $desktopGap: number;
}

const FlexWrapper = styled.div<FlexWrapperProps>`
  gap: ${(props) => `calc(${props.$desktopGap} * 1px)`};

  @media (max-width: 768px) {
    gap: ${(props) => `calc(${props.$mobileGap} * 1px)`};
  }
`;

const Flex: React.FC<FlexProps> = ({
  children,
  gap,
  direction,
  align,
  justify,
  wrap = false,
  flex,
  style,
  ...rest
}) => {
  const mobileGap = typeof gap === 'number' ? gap : (gap?.mobile ?? 0);
  const desktopGap = typeof gap === 'number' ? gap : (gap?.desktop ?? 0);

  const flexValue = flex === true ? 1 : flex === false ? 0 : flex;
  const wrapValue = wrap === true ? 'wrap' : 'nowrap';

  return (
    <FlexWrapper
      $mobileGap={mobileGap}
      $desktopGap={desktopGap}
      style={{
        ...style,
        display: 'flex',
        flexDirection: direction,
        flexWrap: wrapValue,
        alignItems: align,
        justifyContent: justify,
        flex: flexValue,
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
  gap = 0,
  wrap = false,
  flex = false,
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
  gap = 0,
  wrap = false,
  flex = false,
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
