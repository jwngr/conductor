import {createRootRoute, Outlet} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {IS_DEVELOPMENT} from '@sharedClient/lib/environment.client';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {Toaster} from '@src/components/atoms/Toaster';
import {TooltipProvider} from '@src/components/atoms/Tooltip';
import {AuthSubscriptions} from '@src/components/auth/AuthSubscriptions';
import {DevToolbar} from '@src/components/devToolbar/DevToolbar';
import {RegisterDebugDevToolbarSection} from '@src/components/devToolbar/RegisterDebugDevToolbarSection';
import {RegisterFeedItemImporterDevToolbarSection} from '@src/components/devToolbar/RegisterFeedItemImporterDevTool';
import {ErrorBoundary} from '@src/components/errors/ErrorBoundary';
import {PWAExperimentsListener} from '@src/components/experiments/PWAExperimentsListener';
import {ThemeProvider} from '@src/components/ThemeProvider';

import {DefaultErrorScreen} from '@src/screens/ErrorScreen';

/**
 * Subscriptions that are always active whenever the app is loaded.
 */
const PermanentGlobalSubscriptions: React.FC = () => {
  return (
    <>
      <AuthSubscriptions />
      <RegisterDebugDevToolbarSection />
    </>
  );
};

/**
 * Subscriptions that are active whenever there is a logged-in account.
 */
const LoggedInGlobalSubscriptions: React.FC = () => {
  const {isLoading, loggedInAccount} = useMaybeLoggedInAccount();

  if (isLoading || !loggedInAccount) return null;

  return (
    <>
      <RegisterFeedItemImporterDevToolbarSection />
      <PWAExperimentsListener />
    </>
  );
};

const RootComponent: React.FC = () => {
  const shouldShowRouterDevTools = useDevToolbarStore((state) => state.shouldShowRouterDevTools);

  return (
    <TooltipProvider>
      <ThemeProvider>
        <ErrorBoundary fallback={(error) => <DefaultErrorScreen error={error} />}>
          <Outlet />
          <Toaster richColors />
          <PermanentGlobalSubscriptions />
          <LoggedInGlobalSubscriptions />
          <DevToolbar />
          {IS_DEVELOPMENT && shouldShowRouterDevTools ? <TanStackRouterDevtools /> : null}
        </ErrorBoundary>
      </ThemeProvider>
    </TooltipProvider>
  );
};

export const rootRoute = createRootRoute({
  component: RootComponent,
});
