import {getNavItemIdFromViewType} from '@shared/lib/navItems.shared';

import type {ViewType} from '@shared/types/views.types';

import {ViewRenderer} from '@src/components/views/View';

import {getRouteFromViewType} from '@src/lib/router.pwa';

import {Screen} from '@src/screens/Screen';

export const ViewScreen: React.FC<{
  readonly viewType: ViewType;
}> = ({viewType}) => {
  const selectedNavItemId = getNavItemIdFromViewType(viewType);

  const currentRoute = getRouteFromViewType(viewType);
  const {feedItemId: selectedFeedItemId} = currentRoute.useSearch();

  return (
    <Screen selectedNavItemId={selectedNavItemId} withHeader>
      <ViewRenderer viewType={viewType} selectedFeedItemId={selectedFeedItemId} />
    </Screen>
  );
};
