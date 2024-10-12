import {StyleAttributes} from '@shared/types';
import styled from 'styled-components';

interface SpacerWrapperProps {
  readonly $widthDesktop: number;
  readonly $widthMobile: number;
  readonly $heightDesktop: number;
  readonly $heightMobile: number;
}

const SpacerWrapper = styled.div<SpacerWrapperProps>`
  width: ${(props) => props.$widthDesktop}px;
  height: ${(props) => props.$heightDesktop}px;

  @media (max-width: 760px) {
    width: ${(props) => props.$widthMobile}px;
    height: ${(props) => props.$heightMobile}px;
  }
`;

interface SpacerProps extends StyleAttributes {
  readonly x?: number | {readonly mobile?: number; readonly desktop?: number};
  readonly y?: number | {readonly mobile?: number; readonly desktop?: number};
  readonly flex?: number | string | boolean;
}

export const Spacer: React.FC<SpacerProps> = ({x, y, flex, ...rest}) => {
  const widthDesktop = typeof x === 'number' ? x : x?.desktop ? x.desktop : 0;
  const widthMobile = typeof x === 'number' ? x : x?.mobile ? x.mobile : 0;

  const heightDesktop = typeof y === 'number' ? y : y?.desktop ? y.desktop : 0;
  const heightMobile = typeof y === 'number' ? y : y?.mobile ? y.mobile : 0;

  const flexValue = flex === true ? 1 : flex === false ? 0 : flex;

  return (
    <SpacerWrapper
      $widthDesktop={widthDesktop}
      $widthMobile={widthMobile}
      $heightDesktop={heightDesktop}
      $heightMobile={heightMobile}
      style={{flex: flexValue}}
      {...rest}
    >
      &nbsp;
    </SpacerWrapper>
  );
};
