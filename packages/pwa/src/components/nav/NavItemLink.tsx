import type React from 'react';

import type {NavItemId} from '@shared/types/urls.types';

import {Link} from '@src/components/atoms/Link';
import type {LinkProps} from '@src/components/atoms/Link';

import {getRouteFromNavItemId} from '@src/lib/router.pwa';

interface NavItemLinkProps extends LinkProps {
  readonly navItemId: NavItemId;
}

export const NavItemLink: React.FC<NavItemLinkProps> = ({navItemId, children, ...linkProps}) => {
  const route = getRouteFromNavItemId(navItemId);

  return (
    <Link to={route.to} {...linkProps}>
      {children}
    </Link>
  );
};
