import type React from 'react';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {authService} from '@src/lib/auth.pwa';

import {SignInRedirect} from '@src/routes/Redirects';

export const RequireLoggedInAccount: React.FC<{
  readonly children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/promise-function-async
}> = ({children}) => {
  const {isLoading, loggedInAccount} = useMaybeLoggedInAccount();

  // Wait to show anything until we know the auth state.
  if (isLoading) return null;

  // Account is logged in, so show the requested component.
  if (loggedInAccount) return children;

  // Ignore paths which directly affect auth state and cause a race if checked here.
  const isIgnoredPath = authService.isSignInWithEmailLink(window.location.href);
  if (isIgnoredPath) return null;

  // If not logged in, redirect to sign-in page.
  return <SignInRedirect />;
};
