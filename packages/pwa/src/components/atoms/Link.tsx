import type {LinkProps as RouterLinkProps} from 'react-router-dom';
import {Link as RouterLink} from 'react-router-dom';

import {cn} from '@src/lib/utils.pwa';

export const Link: React.FC<RouterLinkProps> = ({children, className, ...props}) => {
  return (
    <RouterLink className={cn('text-current no-underline', className)} {...props}>
      {children}
    </RouterLink>
  );
};

export const ExternalLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  children,
  className,
  target = '_blank',
  rel = 'noopener noreferrer',
  ...props
}) => {
  return (
    <a className={cn('text-current underline', className)} target={target} rel={rel} {...props}>
      {children}
    </a>
  );
};
