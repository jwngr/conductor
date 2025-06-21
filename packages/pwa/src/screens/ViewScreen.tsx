import {getNavItemIdFromViewType} from '@shared/lib/navItems.shared';
import {PARSING_FAILURE_SENTINEL} from '@shared/lib/parser.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {FeedItemId} from '@shared/types/ids.types';
import {ViewType} from '@shared/types/views.types';

import {ViewListIgnoringDelivery, ViewListRespectingDelivery} from '@src/components/views/View';

import {getRouteFromViewType} from '@src/lib/router.pwa';

import {NotFoundScreen} from '@src/screens/404';
import {Screen} from '@src/screens/Screen';

const ViewScreenMainContent: React.FC<{
  readonly viewType: ViewType;
  readonly selectedFeedItemId: FeedItemId | null;
}> = ({viewType, selectedFeedItemId}) => {
  // Split views based on whether or not they filter items based on delivery schedules. This is
  // because fetching delivery schedules is more expensive, so we want to avoid doing so for views
  // which do not need them.
  switch (viewType) {
    case ViewType.Untriaged:
      return (
        <ViewListRespectingDelivery
          viewType={viewType}
          selectedFeedItemId={selectedFeedItemId ?? null}
        />
      );
    case ViewType.Saved:
    case ViewType.Done:
    case ViewType.Trashed:
    case ViewType.Unread:
    case ViewType.Starred:
    case ViewType.All:
    case ViewType.Today:
      return (
        <ViewListIgnoringDelivery
          viewType={viewType}
          selectedFeedItemId={selectedFeedItemId ?? null}
        />
      );
    default:
      assertNever(viewType);
  }
};

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
      <ViewScreenMainContent viewType={viewType} selectedFeedItemId={selectedFeedItemId ?? null} />
    </Screen>
  );
};
