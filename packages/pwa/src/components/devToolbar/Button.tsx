import {styled} from 'styled-components';

// TODO: Make atomic `Button` component.
export const Button = styled.button`
  padding: 8px 12px;
  border-radius: 4px;
  background-color: ${({theme}) => theme.colors.primary};
  color: ${({theme}) => theme.colors.background};
  border: none;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }
`;
