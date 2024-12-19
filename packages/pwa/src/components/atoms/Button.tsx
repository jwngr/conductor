import styled, {css} from 'styled-components';

import {assertNever} from '@shared/lib/utils';

import {ThemeColor} from '@shared/types/theme.types';

export enum ButtonVariant {
  Primary = 'PRIMARY',
  Secondary = 'SECONDARY',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant: ButtonVariant;
}

export const Button = styled.button<ButtonProps>`
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid ${({theme}) => theme.colors[ThemeColor.Neutral500]};

  ${({theme, variant}) => {
    switch (variant) {
      case ButtonVariant.Primary:
        return css`
          background-color: ${theme.colors[ThemeColor.Neutral900]};
          color: ${theme.colors[ThemeColor.Neutral100]};
        `;
      case ButtonVariant.Secondary:
        return css`
          background-color: transparent;
          color: ${theme.colors[ThemeColor.Neutral900]};
        `;
      default:
        assertNever(variant);
    }
  }}

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;
