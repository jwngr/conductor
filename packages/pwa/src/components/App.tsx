import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import {theme} from '@shared/lib/theme';
import {Urls} from '@shared/lib/urls';

import {Toaster} from '@src/components/atoms/Toaster';
import {TooltipProvider} from '@src/components/atoms/Tooltip';
import {AuthSubscriptions} from '@src/components/auth/AuthSubscriptions';
import {RequireLoggedInUser} from '@src/components/auth/RequireLoggedInUser';
import {SignOutRedirect} from '@src/components/auth/SignOutRedirect';
import {DevToolbar} from '@src/components/devToolbar/DevToolbar';

import {NotFoundScreen} from '@src/screens/404';
import {FeedItemScreen} from '@src/screens/FeedItemScreen';
import {FeedsScreen} from '@src/screens/FeedsScreen';
import {SignInScreen} from '@src/screens/SignInScreen';
import {ViewScreen} from '@src/screens/ViewScreen';

export const CatchAllRoute: React.FC = () => {
  // TODO: Prevent ability to use 404s vs logged-out redirects to figure out what routes exist.
  return <NotFoundScreen message="Page not found" />;
};

const AllRoutes: React.FC = () => {
  const orderedNavItems = Urls.getOrderedNavItems();
  return (
    <Routes>
      {/* Publicly visible routes. */}
      <Route path={Urls.forSignIn()} element={<SignInScreen />} />
      <Route path={Urls.forSignOut()} element={<SignOutRedirect />} />

      {/* Authenticated routes. */}
      {orderedNavItems.map((item) => (
        <Route
          key={item.viewType}
          path={Urls.forView(item.viewType)}
          element={
            <RequireLoggedInUser>
              <ViewScreen viewType={item.viewType} />
            </RequireLoggedInUser>
          }
        />
      ))}
      <Route
        path={Urls.forFeedItemUnsafe(':feedItemId')}
        element={
          <RequireLoggedInUser>
            <FeedItemScreen />
          </RequireLoggedInUser>
        }
      />
      <Route
        path={Urls.forFeeds()}
        element={
          <RequireLoggedInUser>
            <FeedsScreen />
          </RequireLoggedInUser>
        }
      />

      {/* Catch-all route. */}
      <Route path="*" element={<CatchAllRoute />} />
    </Routes>
  );
};

const AppWideSubscriptions: React.FC = () => {
  return (
    <>
      <AuthSubscriptions />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <TooltipProvider>
        <BrowserRouter
          // Pass flags to silence console logs.
          future={{v7_startTransition: true, v7_relativeSplatPath: true}}
        >
          <AllRoutes />
          <AppWideSubscriptions />
          <DevToolbar />
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
};
