import {Navigate} from '@tanstack/react-router';
import {isSignInWithEmailLink} from 'firebase/auth';
import type React from 'react';

import {firebaseService} from '@sharedClient/services/firebase.client';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {signInRoute} from '@src/routes';

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
  const isIgnoredPath = isSignInWithEmailLink(firebaseService.auth, window.location.href);
  if (isIgnoredPath) return null;

  // If not logged in, redirect to sign-in page.
  return <Navigate to={signInRoute.fullPath} replace />;
};
