import {forwardRef} from 'react';
import styled, {css} from 'styled-components';

import {assertNever} from '@shared/lib/utils.shared';

import {ThemeColor} from '@shared/types/theme.types';

export enum ButtonVariant {
  Primary = 'PRIMARY',
  Secondary = 'SECONDARY',
}

interface ButtonWrapperProps {
  readonly $variant: ButtonVariant;
}

const ButtonWrapper = styled.button<ButtonWrapperProps>`
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid ${({theme}) => theme.colors[ThemeColor.Neutral500]};

  ${({theme, $variant}) => {
    switch ($variant) {
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
        assertNever($variant);
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

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant: ButtonVariant;
}

export const Button: React.FC<ButtonProps> = forwardRef<HTMLButtonElement, ButtonProps>(
  ({variant, ...props}, ref) => {
    return <ButtonWrapper $variant={variant} {...props} ref={ref} />;
  }
);
Button.displayName = 'Button';
