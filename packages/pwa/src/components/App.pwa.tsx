import React, {StrictMode} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import {theme} from '@shared/lib/theme.shared';
import {Urls} from '@shared/lib/urls.shared';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {ErrorBoundary} from '@src/components/atoms/ErrorBoundary';
import {Toaster} from '@src/components/atoms/Toaster';
import {TooltipProvider} from '@src/components/atoms/Tooltip';
import {AuthSubscriptions} from '@src/components/auth/AuthSubscriptions';
import {RequireLoggedInAccount} from '@src/components/auth/RequireLoggedInAccount';
import {SignOutRedirect} from '@src/components/auth/SignOutRedirect';
import {DevToolbar} from '@src/components/devToolbar/DevToolbar';
import {RegisterFeedItemImporterDevToolbarSection} from '@src/components/devToolbar/RegisterFeedItemImporterDevTool';
import {RegisterAccountFeedSubscriberDevToolbarSection} from '@src/components/devToolbar/RegisterUserFeedSubscriberDevToolbarActions';

import {NotFoundScreen} from '@src/screens/404';
import {ErrorScreen} from '@src/screens/ErrorScreen';
import {FeedItemScreen} from '@src/screens/FeedItemScreen';
import {FeedSubscriptionsScreen} from '@src/screens/FeedSubscriptionsScreen';
import {SignInScreen} from '@src/screens/SignInScreen';
import {StyleguideScreen} from '@src/screens/StyleguideScreen';
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
      <Route path={Urls.forStyleguide()} element={<StyleguideScreen />} />

      {/* Authenticated routes. */}
      {orderedNavItems.map((item) => (
        <Route
          key={item.viewType}
          path={Urls.forView(item.viewType)}
          element={
            <RequireLoggedInAccount>
              <ViewScreen viewType={item.viewType} />
            </RequireLoggedInAccount>
          }
        />
      ))}
      <Route
        path={Urls.forFeedItemUnsafe(':feedItemId')}
        element={
          <RequireLoggedInAccount>
            <FeedItemScreen />
          </RequireLoggedInAccount>
        }
      />
      <Route
        path={Urls.forFeedSubscriptions()}
        element={
          <RequireLoggedInAccount>
            <FeedSubscriptionsScreen />
          </RequireLoggedInAccount>
        }
      />

      {/* Catch-all route. */}
      <Route path="*" element={<CatchAllRoute />} />
    </Routes>
  );
};

/**
 * Subscriptions that are always active whenever the app is loaded.
 */
const PermanentGlobalSubscriptions: React.FC = () => {
  return (
    <>
      <AuthSubscriptions />
    </>
  );
};

/**
 * Subscriptions that are active whenever there is a logged-in account.
 */
const LoggedInGlobalSubscriptions: React.FC = () => {
  const loggedInAccount = useMaybeLoggedInAccount();

  if (!loggedInAccount) return null;

  return (
    <RequireLoggedInAccount>
      <RegisterFeedItemImporterDevToolbarSection />
      <RegisterAccountFeedSubscriberDevToolbarSection />
    </RequireLoggedInAccount>
  );
};

export const App: React.FC = () => {
  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <TooltipProvider>
          <BrowserRouter
            // Pass flags to silence console logs.
            future={{v7_startTransition: true, v7_relativeSplatPath: true}}
          >
            <ErrorBoundary fallback={(error) => <ErrorScreen error={error} />}>
              <AllRoutes />
              <PermanentGlobalSubscriptions />
              <LoggedInGlobalSubscriptions />
              <DevToolbar />
            </ErrorBoundary>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </StrictMode>
  );
};
