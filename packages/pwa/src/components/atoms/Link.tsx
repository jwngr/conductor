import {Link as RouterLink, LinkProps as RouterLinkProps} from 'react-router-dom';
import styled from 'styled-components';

const LinkWrapper = styled(RouterLink)`
  text-decoration: none;
  color: unset;
`;

export const Link: React.FC<RouterLinkProps> = ({children, ...props}) => {
  return <LinkWrapper {...props}>{children}</LinkWrapper>;
};