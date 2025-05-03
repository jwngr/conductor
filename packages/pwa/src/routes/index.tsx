import {createRoute} from '@tanstack/react-router';

import {Views} from '@shared/lib/views.shared';

import {ViewType} from '@shared/types/views.types';

import {RequireLoggedInAccount} from '@src/components/auth/RequireLoggedInAccount';
import {SignOutRedirect} from '@src/components/auth/SignOutRedirect';

import {rootRoute} from '@src/routes/__root';
import {NotFoundScreen} from '@src/screens/404';
import {FeedItemScreen} from '@src/screens/FeedItemScreen';
import {FeedSubscriptionsScreen} from '@src/screens/FeedSubscriptionsScreen';
import {ImportScreen} from '@src/screens/ImportScreen';
import {SignInScreen} from '@src/screens/SignInScreen';
import {StoriesScreen} from '@src/screens/StoriesScreen';
import {ViewScreen} from '@src/screens/ViewScreen';

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

export const storiesDefaultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ui',
  component: StoriesScreen,
});

export const storiesRoute = createRoute({
  getParentRoute: () => storiesDefaultRoute,
  path: '/$sidebarItemId',
  component: StoriesScreen,
});

///////////////////////////
//  AUTHENTICATED ROUTES //
///////////////////////////
export const allViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/all',
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.All} />
    </RequireLoggedInAccount>
  ),
});

export const todayViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/today',
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Today} />
    </RequireLoggedInAccount>
  ),
});

export const untriagedViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Untriaged} />
    </RequireLoggedInAccount>
  ),
});

export const unreadViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unread',
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Unread} />
    </RequireLoggedInAccount>
  ),
});

export const starredViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/starred',
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Starred} />
    </RequireLoggedInAccount>
  ),
});

export const savedViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/saved',
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Saved} />
    </RequireLoggedInAccount>
  ),
});

export const doneViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/done',
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Done} />
    </RequireLoggedInAccount>
  ),
});

export const trashedViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trashed',
  component: () => (
    <RequireLoggedInAccount>
      <ViewScreen viewType={ViewType.Trashed} />
    </RequireLoggedInAccount>
  ),
});

export const feedItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/items/$feedItemId',
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

//////////////////////
//  CATCH-ALL ROUTE //
//////////////////////
export const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: () => <NotFoundScreen message="Page not found" />,
});
