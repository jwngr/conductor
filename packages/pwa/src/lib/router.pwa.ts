import type {AnyRoute} from '@tanstack/react-router';

import {assertNever} from '@shared/lib/utils.shared';

import {NavItemId} from '@shared/types/urls.types';
import {ViewType} from '@shared/types/views.types';

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
} from '@src/routes/index';
import type {ViewRoute} from '@src/routes/index';

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
