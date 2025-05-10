import {createRootRoute, Outlet} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {Toaster} from '@src/components/atoms/Toaster';
import {TooltipProvider} from '@src/components/atoms/Tooltip';
import {AuthSubscriptions} from '@src/components/auth/AuthSubscriptions';
import {DevToolbar} from '@src/components/devToolbar/DevToolbar';
import {RegisterFeedItemImporterDevToolbarSection} from '@src/components/devToolbar/RegisterFeedItemImporterDevTool';
import {ErrorBoundary} from '@src/components/errors/ErrorBoundary';
import {ThemeProvider} from '@src/components/ThemeProvider';

import {IS_DEVELOPMENT} from '@src/lib/environment.pwa';

import {ErrorScreen} from '@src/screens/ErrorScreen';

/**
 * Subscriptions that are always active whenever the app is loaded.
 */
const PermanentGlobalSubscriptions: React.FC = () => {
  return <AuthSubscriptions />;
};

/**
 * Subscriptions that are active whenever there is a logged-in account.
 */
const LoggedInGlobalSubscriptions: React.FC = () => {
  const {isLoading, loggedInAccount} = useMaybeLoggedInAccount();

  if (isLoading || !loggedInAccount) return null;

  return <RegisterFeedItemImporterDevToolbarSection />;
};

export const rootRoute = createRootRoute({
  component: () => (
    <TooltipProvider>
      <ThemeProvider>
        <ErrorBoundary fallback={(error) => <ErrorScreen error={error} />}>
          <Outlet />
          <Toaster richColors />
          <PermanentGlobalSubscriptions />
          <LoggedInGlobalSubscriptions />
          <DevToolbar />
          {IS_DEVELOPMENT ? <TanStackRouterDevtools /> : null}
        </ErrorBoundary>
      </ThemeProvider>
    </TooltipProvider>
  ),
});
