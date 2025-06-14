import {Navigate} from '@tanstack/react-router';

import {DEFAULT_STORIES_SIDEBAR_ITEM} from '@shared/lib/stories.shared';

import {storiesRoute} from '@src/routes';

export const StoriesDefaultRedirect: React.FC = () => {
  return (
    <Navigate
      to={storiesRoute.to}
      params={{sidebarItemId: DEFAULT_STORIES_SIDEBAR_ITEM.sidebarItemId}}
    />
  );
};
