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

  // Ignore "sign-in with email" links which affect auth state and causes a race if it is checked.
  if (isSignInWithEmailLink(auth, window.location.href)) {
    return children;
  }

  // Wait to show anything until we know the auth state.
  // TODO: Better loading state.
  if (isLoading) return null;

  // If the user is not logged in, redirect them to the sign-in page.
  if (!loggedInUser) {
    return <Navigate to={Urls.forSignIn()} replace />;
  }

  // The user is logged in, so show the requested component.
  return children;
};
