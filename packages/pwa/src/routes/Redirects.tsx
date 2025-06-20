import {Navigate} from '@tanstack/react-router';

import {DEFAULT_STORIES_SIDEBAR_ITEM} from '@shared/lib/stories.shared';

import {DEFAULT_ROUTE, signInRoute, storiesRoute} from '@src/routes';

export const StoriesDefaultRedirect: React.FC = () => {
  return (
    <Navigate
      to={storiesRoute.to}
      params={{sidebarItemId: DEFAULT_STORIES_SIDEBAR_ITEM.sidebarItemId}}
    />
  );
};

export const DefaultRouteRedirect: React.FC = () => {
  return <Navigate to={DEFAULT_ROUTE.to} replace search={{feedItemId: undefined}} />;
};

export const SignInRedirect: React.FC = () => {
  return <Navigate to={signInRoute.to} replace />;
};
