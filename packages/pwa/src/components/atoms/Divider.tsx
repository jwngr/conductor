import styled, {css} from 'styled-components';

import {ThemeColor} from '@shared/types/theme.types';

interface DividerProps {
  readonly x?: number;
  readonly y?: number;
}

export const Divider = styled.div<DividerProps>`
  background-color: ${({theme}) => theme.colors[ThemeColor.Neutral400]};

  ${({x, y}) => {
    // If both `x` and `y` are provided, create a box.
    if (x && y) {
      return css`
        width: ${x}px;
        height: ${y}px;
      `;
    }

    // If only `x` is provided, create a horizontal line.
    if (x) {
      return css`
        width: ${x}px;
        height: 1px;
      `;
    }

    // If only `y` is provided, create a vertical line.
    if (y) {
      return css`
        width: 1px;
        height: ${y}px;
      `;
    }

    // Default to a full-width horizontal line.
    return css`
      width: 100%;
      height: 1px;
    `;
  }}
`;
