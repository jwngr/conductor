import type {AnyRoute} from '@tanstack/react-router';
import {toast} from 'sonner';

import {findStoriesSidebarItemById} from '@shared/lib/stories.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseStoriesSidebarItemId} from '@shared/parsers/stories.parser';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {StoriesSidebarItem} from '@shared/types/stories.types';
import {NavItemId} from '@shared/types/urls.types';
import {ViewType} from '@shared/types/views.types';

import {
  allViewRoute,
  doneViewRoute,
  experimentsRoute,
  feedItemRoute,
  feedSubscriptionsRoute,
  importRoute,
  savedViewRoute,
  starredViewRoute,
  storiesRoute,
  todayViewRoute,
  trashedViewRoute,
  unreadViewRoute,
  untriagedViewRoute,
} from '@src/routes/index';
import type {ViewRoute} from '@src/routes/index';

/**
 * Returns the feed item ID from the URL path of a feed item route.
 *
 * E.g. `/items/123`
 */
export function useFeedItemIdFromUrlPath(): FeedItemId | null {
  const {feedItemId: feedItemIdFromUrl} = feedItemRoute.useParams();

  if (!feedItemIdFromUrl) return null;

  const feedItemIdResult = parseFeedItemId(feedItemIdFromUrl);
  if (!feedItemIdResult.success) return null;
  return feedItemIdResult.value;
}

export function useSelectedStoryFromUrl(): StoriesSidebarItem | null {
  const {sidebarItemId: sidebarItemIdFromUrl} = storiesRoute.useParams();

  if (!sidebarItemIdFromUrl) return null;

  const sidebarItemIdResult = parseStoriesSidebarItemId(sidebarItemIdFromUrl);
  if (!sidebarItemIdResult.success) {
    toast.error('Unexpected story ID', {
      description: sidebarItemIdFromUrl,
    });
    return null;
  }

  return findStoriesSidebarItemById(sidebarItemIdResult.value);
}

export function getRouteFromViewType(viewType: ViewType): ViewRoute {
  switch (viewType) {
    case ViewType.All:
      return allViewRoute;
    case ViewType.Today:
      return todayViewRoute;
    case ViewType.Untriaged:
      return untriagedViewRoute;
    case ViewType.Unread:
      return unreadViewRoute;
    case ViewType.Starred:
      return starredViewRoute;
    case ViewType.Saved:
      return savedViewRoute;
    case ViewType.Done:
      return doneViewRoute;
    case ViewType.Trashed:
      return trashedViewRoute;
    default:
      assertNever(viewType);
  }
}

export function getRouteFromNavItemId(navItemId: NavItemId): AnyRoute {
  switch (navItemId) {
    case NavItemId.All:
      return allViewRoute;
    case NavItemId.Today:
      return todayViewRoute;
    case NavItemId.Untriaged:
      return untriagedViewRoute;
    case NavItemId.Unread:
      return unreadViewRoute;
    case NavItemId.Starred:
      return starredViewRoute;
    case NavItemId.Saved:
      return savedViewRoute;
    case NavItemId.Done:
      return doneViewRoute;
    case NavItemId.Trashed:
      return trashedViewRoute;
    case NavItemId.Feeds:
      return feedSubscriptionsRoute;
    case NavItemId.Import:
      return importRoute;
    case NavItemId.Experiments:
      return experimentsRoute;
    default:
      assertNever(navItemId);
  }
}
