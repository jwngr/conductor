import {isSignInWithEmailLink} from 'firebase/auth';
import React from 'react';
import {Navigate} from 'react-router-dom';

import {auth} from '@shared/lib/firebase';
import {Urls} from '@shared/lib/urls';

import {useMaybeLoggedInUser} from '@src/lib/users';

export const RequireLoggedInUser: React.FC<{
  readonly children: React.ReactNode;
}> = ({children}) => {
  const {isLoading, loggedInUser} = useMaybeLoggedInUser();

  // Wait to show anything until we know the auth state.
  if (isLoading) return null;

  // The user is logged in, so show the requested component.
  if (loggedInUser) return children;

  // Ignore paths which directly affect auth state and cause a race if checked here.
  const isIgnoredPath = isSignInWithEmailLink(auth, window.location.href);
  if (isIgnoredPath) return null;

  // If the user is not logged in, redirect them to the sign-in page.
  return <Navigate to={Urls.forSignIn()} replace />;
};
