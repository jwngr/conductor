import {isSignInWithEmailLink} from 'firebase/auth';
import React from 'react';
import {Navigate} from 'react-router-dom';

import {Urls} from '@shared/lib/urls.shared';

import {firebaseService} from '@sharedClient/services/firebase.client';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

export const RequireLoggedInAccount: React.FC<{
  readonly children: React.ReactNode;
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
  return <Navigate to={Urls.forSignIn()} replace />;
};
