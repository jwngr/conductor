import type {Route} from '@tanstack/react-router';
import {toast} from 'sonner';

import {findStoriesSidebarItemById} from '@shared/lib/stories.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseStoriesSidebarItemId} from '@shared/parsers/stories.parser';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {StoriesSidebarItem} from '@shared/types/stories.types';
import type {NavItem} from '@shared/types/urls.types';
import {NavItemId} from '@shared/types/urls.types';

import {
  allViewRoute,
  doneViewRoute,
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

export const useFeedItemIdFromUrl = (): FeedItemId | null => {
  const {feedItemId: feedItemIdFromUrl} = feedItemRoute.useParams();

  if (!feedItemIdFromUrl) return null;

  const feedItemIdResult = parseFeedItemId(feedItemIdFromUrl);
  if (!feedItemIdResult.success) return null;
  return feedItemIdResult.value;
};

export const useSelectedStoryFromUrl = (): StoriesSidebarItem | null => {
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
};

export function getUrlForNavItem(navItem: NavItem): string {
  switch (navItem.id) {
    case NavItemId.Feeds:
      return feedSubscriptionsRoute.fullPath;
    case NavItemId.Import:
      return importRoute.fullPath;
    case NavItemId.Untriaged:
      return untriagedViewRoute.fullPath;
    case NavItemId.Saved:
      return savedViewRoute.fullPath;
    case NavItemId.Done:
      return doneViewRoute.fullPath;
    case NavItemId.Starred:
      return starredViewRoute.fullPath;
    case NavItemId.All:
      return allViewRoute.fullPath;
    case NavItemId.Today:
      return todayViewRoute.fullPath;
    case NavItemId.Trashed:
      return trashedViewRoute.fullPath;
    case NavItemId.Unread:
      return unreadViewRoute.fullPath;
    default:
      assertNever(navItem.id);
  }
}

export function getRouteForNavItem(navItem: NavItem): Route {
  switch (navItem.id) {
    case NavItemId.Feeds:
      return feedSubscriptionsRoute;
    case NavItemId.Import:
      return importRoute;
    case NavItemId.Untriaged:
      return untriagedViewRoute;
    case NavItemId.Saved:
      return savedViewRoute;
    case NavItemId.Done:
      return doneViewRoute;
    case NavItemId.Starred:
      return starredViewRoute;
    case NavItemId.All:
      return allViewRoute;
    case NavItemId.Today:
      return todayViewRoute;
    case NavItemId.Trashed:
      return trashedViewRoute;
    case NavItemId.Unread:
      return unreadViewRoute;
    default:
      assertNever(navItem.id);
  }
}
