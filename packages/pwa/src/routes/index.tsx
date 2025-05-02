import {createRoute} from '@tanstack/react-router';

import {Urls} from '@shared/lib/urls.shared';
import {Views} from '@shared/lib/views.shared';

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
  path: Urls.forSignIn(),
  component: SignInScreen,
});

export const signOutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Urls.forSignOut(),
  component: SignOutRedirect,
});

export const storiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Urls.forStories(),
  component: StoriesScreen,
});

///////////////////////////
//  AUTHENTICATED ROUTES //
///////////////////////////
export const viewRoutes = Views.getAllViewTypes().map((viewType) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: Urls.forView(viewType),
    component: () => (
      <RequireLoggedInAccount>
        <ViewScreen viewType={viewType} />
      </RequireLoggedInAccount>
    ),
  })
);

export const feedItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Urls.forFeedItemUnsafe('$feedItemId'),
  component: () => (
    <RequireLoggedInAccount>
      <FeedItemScreen />
    </RequireLoggedInAccount>
  ),
});

export const feedSubscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Urls.forFeedSubscriptions(),
  component: () => (
    <RequireLoggedInAccount>
      <FeedSubscriptionsScreen />
    </RequireLoggedInAccount>
  ),
});

export const importRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: Urls.forImport(),
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
