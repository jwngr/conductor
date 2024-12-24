import * as React from 'react';
import styled from 'styled-components';

import {ThemeColor} from '@shared/types/theme.types';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputWrapper = styled.input`
  flex: 1;
  height: 40px;
  border-radius: 4px;

  border: 1px solid ${({theme}) => theme.colors[ThemeColor.Neutral500]};
  background-color: transparent;
  padding: 8px 12px;
  font-size: 14px;
  color: ${({theme}) => theme.colors[ThemeColor.Neutral900]};
  transition: color 0.2s ease-in-out;

  &::placeholder {
    color: ${({theme}) => theme.colors[ThemeColor.Neutral500]};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <InputWrapper ref={ref} {...props} />;
});
Input.displayName = 'Input';

export {Input};
