import styled from 'styled-components';

import {ThemeColor} from '@shared/types/theme.types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary';
}

export const Button = styled.button<ButtonProps>`
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid ${({theme}) => theme.colors[ThemeColor.Neutral500]};

  background-color: ${({theme, variant}) =>
    variant === 'secondary' ? 'transparent' : theme.colors[ThemeColor.Neutral900]};
  color: ${({theme, variant}) =>
    variant === 'secondary'
      ? theme.colors[ThemeColor.Neutral900]
      : theme.colors[ThemeColor.Neutral100]};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;
