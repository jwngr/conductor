import {createRoute} from '@tanstack/react-router';

import {PARSING_FAILURE_SENTINEL} from '@shared/lib/parser.shared';

import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseStoriesSidebarItemId} from '@shared/parsers/stories.parser';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {StoriesSidebarItemId} from '@shared/types/stories.types';
import {ViewType} from '@shared/types/views.types';

import {RequireLoggedInAccount} from '@src/components/auth/RequireLoggedInAccount';
import {SignOutRedirect} from '@src/components/auth/SignOutRedirect';

import {rootRoute} from '@src/routes/__root';
import {StoriesDefaultRedirect} from '@src/routes/Redirects';
import {NotFoundScreen} from '@src/screens/404';
import {ExperimentsScreen} from '@src/screens/ExperimentsScreen';
import {FeedItemScreen} from '@src/screens/FeedItemScreen';
import {FeedSubscriptionsScreen} from '@src/screens/FeedSubscriptionsScreen';
import {ImportScreen} from '@src/screens/ImportScreen';
import {SignInScreen} from '@src/screens/SignInScreen';
import {StoriesScreen} from '@src/screens/StoriesScreen';
import {ViewScreen} from '@src/screens/ViewScreen';

/////////////////////////
//  VALIDATION HELPERS //
/////////////////////////
function storiesSidebarItemIdParseParamsHandler(params: {sidebarItemId: string}): {
  sidebarItemId: StoriesSidebarItemId | typeof PARSING_FAILURE_SENTINEL | undefined;
} {
  const rawSidebarItemId = params.sidebarItemId;

  if (
    typeof rawSidebarItemId === 'undefined' ||
    (typeof rawSidebarItemId === 'string' && rawSidebarItemId.length === 0)
  ) {
    return {sidebarItemId: undefined};
  }

  const result = parseStoriesSidebarItemId(rawSidebarItemId);
  if (!result.success) {
    return {sidebarItemId: PARSING_FAILURE_SENTINEL};
  }

  return {sidebarItemId: result.value};
}

function feedItemIdSearchHandler(search: Record<string, unknown>): {
  feedItemId: FeedItemId | typeof PARSING_FAILURE_SENTINEL | undefined;
} {
  const rawFeedItemId = search.feedItemId;

  if (
    typeof rawFeedItemId === 'undefined' ||
    (typeof rawFeedItemId === 'string' && rawFeedItemId.length === 0)
  ) {
    return {feedItemId: undefined};
  }

  const parsedResult = parseFeedItemId(rawFeedItemId);

  if (!parsedResult.success) {
    return {feedItemId: PARSING_FAILURE_SENTINEL};
  }

  return {feedItemId: parsedResult.value};
}

////////////////////
//  PUBLIC ROUTES //
////////////////////
export const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: SignInScreen,
});

export const signOutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/logout',
  component: SignOutRedirect,
});

export const storiesRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ui',
  component: StoriesDefaultRedirect,
});

export const storiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ui/$sidebarItemId',
  parseParams: storiesSidebarItemIdParseParamsHandler,
  component: StoriesScreen,
});

///////////////////////////
//  AUTHENTICATED ROUTES //
///////////////////////////
export const allViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/all',
  validateSearch: feedItemIdSearchHandler,
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.All} />
    </RequireLoggedInAccount>
  ),
});

export const todayViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/today',
  validateSearch: feedItemIdSearchHandler,
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Today} />
    </RequireLoggedInAccount>
  ),
});

export const untriagedViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: feedItemIdSearchHandler,
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Untriaged} />
    </RequireLoggedInAccount>
  ),
});

export const unreadViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unread',
  validateSearch: feedItemIdSearchHandler,
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Unread} />
    </RequireLoggedInAccount>
  ),
});

export const starredViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/starred',
  validateSearch: feedItemIdSearchHandler,
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Starred} />
    </RequireLoggedInAccount>
  ),
});

export const savedViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/saved',
  validateSearch: feedItemIdSearchHandler,
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Saved} />
    </RequireLoggedInAccount>
  ),
});

export const doneViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/done',
  validateSearch: feedItemIdSearchHandler,
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Done} />
    </RequireLoggedInAccount>
  ),
});

export const trashedViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trashed',
  validateSearch: feedItemIdSearchHandler,
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Trashed} />
    </RequireLoggedInAccount>
  ),
});

export const feedItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/items/$feedItemId',
  parseParams: feedItemIdSearchHandler,
  component: () => (
    <RequireLoggedInAccount>
      <FeedItemScreen />
    </RequireLoggedInAccount>
  ),
});

export const feedSubscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feeds',
  component: () => (
    <RequireLoggedInAccount>
      <FeedSubscriptionsScreen />
    </RequireLoggedInAccount>
  ),
});

export const importRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/import',
  component: () => (
    <RequireLoggedInAccount>
      <ImportScreen />
    </RequireLoggedInAccount>
  ),
});

export const experimentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/experiments',
  component: () => (
    <RequireLoggedInAccount>
      <ExperimentsScreen />
    </RequireLoggedInAccount>
  ),
});

export type ViewRoute =
  | typeof allViewRoute
  | typeof todayViewRoute
  | typeof untriagedViewRoute
  | typeof unreadViewRoute
  | typeof starredViewRoute
  | typeof savedViewRoute
  | typeof doneViewRoute
  | typeof trashedViewRoute;

//////////////////////
//  CATCH-ALL ROUTE //
//////////////////////
export const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: () => <NotFoundScreen title={undefined} subtitle={undefined} />,
});

export const DEFAULT_ROUTE = untriagedViewRoute;
