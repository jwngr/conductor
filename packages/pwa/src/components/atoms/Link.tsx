import type {LinkProps as TanStackLinkProps} from '@tanstack/react-router';
import {Link as TanStackLink} from '@tanstack/react-router';

import type {StyleAttributes} from '@shared/types/utils.types';

import {cn} from '@src/lib/utils.pwa';

interface LinkProps extends TanStackLinkProps, StyleAttributes {
  readonly onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const Link: React.FC<LinkProps> = ({children, className, onClick, ...props}) => {
  return (
    <TanStackLink
      className={cn('text-current no-underline', className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </TanStackLink>
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
