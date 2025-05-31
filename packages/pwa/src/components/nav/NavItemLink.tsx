import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {NavItemId} from '@shared/types/urls.types';

import type {WithChildren} from '@sharedClient/types/utils.client.types';

import {Link} from '@src/components/atoms/Link';
import type {LinkProps} from '@src/components/atoms/Link';

import {
  allViewRoute,
  doneViewRoute,
  experimentsRoute,
  feedSubscriptionsRoute,
  importRoute,
  savedViewRoute,
  starredViewRoute,
  todayViewRoute,
  trashedViewRoute,
  unreadViewRoute,
  untriagedViewRoute,
} from '@src/routes';

interface NavItemLinkProps extends LinkProps {
  readonly navItemId: NavItemId;
}

export const NavItemLink: React.FC<WithChildren<NavItemLinkProps>> = ({
  navItemId,
  children,
  ...linkProps
}) => {
  switch (navItemId) {
    case NavItemId.All:
      return (
        <Link to={allViewRoute.fullPath} {...linkProps}>
          {children}
        </Link>
      );
    case NavItemId.Done:
      return (
        <Link to={doneViewRoute.fullPath} {...linkProps}>
          {children}
        </Link>
      );
    case NavItemId.Saved:
      return (
        <Link to={savedViewRoute.fullPath} {...linkProps}>
          {children}
        </Link>
      );
    case NavItemId.Starred:
      return (
        <Link to={starredViewRoute.fullPath} {...linkProps}>
          {children}
        </Link>
      );
    case NavItemId.Today:
      return (
        <Link to={todayViewRoute.fullPath} {...linkProps}>
          {children}
        </Link>
      );
    case NavItemId.Trashed:
      return (
        <Link to={trashedViewRoute.fullPath} {...linkProps}>
          {children}
        </Link>
      );
    case NavItemId.Unread:
      return (
        <Link to={unreadViewRoute.fullPath} {...linkProps}>
          {children}
        </Link>
      );
    case NavItemId.Untriaged:
      return (
        <Link to={untriagedViewRoute.fullPath} {...linkProps}>
          {children}
        </Link>
      );
    case NavItemId.Feeds:
      return (
        <Link to={feedSubscriptionsRoute.fullPath} {...linkProps}>
          {children}
        </Link>
      );
    case NavItemId.Import:
      return (
        <Link to={importRoute.fullPath} {...linkProps}>
          {children}
        </Link>
      );
    case NavItemId.Experiments:
      return (
        <Link to={experimentsRoute.fullPath} {...linkProps}>
          {children}
        </Link>
      );
    default:
      assertNever(navItemId);
  }
};
