import {logger} from '@shared/lib/logger.shared';
import {getNavItemIdFromViewType} from '@shared/lib/navItems.shared';
import {PARSING_FAILURE_SENTINEL} from '@shared/lib/parser.shared';

import type {ViewType} from '@shared/types/views.types';

import {toast} from '@sharedClient/lib/toasts.client';

import {ViewRenderer} from '@src/components/views/View';

import {getRouteFromViewType} from '@src/lib/router.pwa';

import {NotFoundScreen} from '@src/screens/404';
import {Screen} from '@src/screens/Screen';

export const ViewScreen: React.FC<{
  readonly viewType: ViewType;
}> = ({viewType}) => {
  const selectedNavItemId = getNavItemIdFromViewType(viewType);

  const currentRoute = getRouteFromViewType(viewType);
  const {feedItemId: selectedFeedItemId} = currentRoute.useSearch();

  if (selectedFeedItemId === PARSING_FAILURE_SENTINEL) {
    return (
      <NotFoundScreen title="Invalid feed item ID" subtitle="The ID from the URL failed to parse" />
    );
  }

  return (
    <Screen selectedNavItemId={selectedNavItemId} withHeader>
      <ViewRenderer viewType={viewType} selectedFeedItemId={selectedFeedItemId ?? null} />
    </Screen>
  );
};
