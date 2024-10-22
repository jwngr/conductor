import * as React from 'react';
import styled from 'styled-components';

import {ThemeColor} from '@shared/types/theme';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

const Input = React.forwardRef<HTMLInputElement, InputProps>(({type, ...otherProps}, ref) => {
  return <InputWrapper type={type} ref={ref} {...otherProps} />;
});
Input.displayName = 'Input';

export {Input};
