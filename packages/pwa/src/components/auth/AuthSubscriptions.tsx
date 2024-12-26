import {isSignInWithEmailLink} from 'firebase/auth';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {Urls} from '@shared/lib/urls.shared';

import {isValidEmail} from '@shared/types/user.types';

import {useAuthStore} from '@sharedClient/stores/AuthStore';

import {authService} from '@sharedClient/services/auth.client';
import {firebaseService} from '@sharedClient/services/firebase.client';

const AuthServiceSubscription: React.FC = () => {
  const {setLoggedInUser} = useAuthStore();
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged({
      successCallback: (loggedInUser) => {
        logger.log('User service auth state changed', {loggedInUser});
        setLoggedInUser(loggedInUser);
      },
      errorCallback: (error) => {
        logger.error(prefixError(error, 'User service `onAuthStateChanged` listener errored'));
      },
    });
    return () => unsubscribe();
  }, [setLoggedInUser]);
  return null;
};

const PasswordlessAuthSubscription: React.FC = () => {
  const navigate = useNavigate();
  const {setLoggedInUser} = useAuthStore();
  useEffect(() => {
    const go = async () => {
      // Only do something if the current URL is a "sign-in with email" link.
      if (!isSignInWithEmailLink(firebaseService.auth, window.location.href)) return;

      // The sign in screen persisted the email to login in local storage. If the user opened the
      // link on the same browser as the one used to sign in, this value will be present.
      let email = window.localStorage.getItem('emailForSignIn');

      if (!email) {
        // If the user opened the link on a different device, ask them for the email again.
        // TODO: Replace this prompt with something nicer.
        email = window.prompt('Please provide your email for confirmation');
      }

      // Do nothing if the user didn't provide a valid email.
      if (!isValidEmail(email)) {
        logger.log('Invalid email provided for passwordless sign-in', {email});
        return;
      }

      const authCredentialResult = await authService.signInWithEmailLink(
        email,
        window.location.href
      );

      if (!authCredentialResult.success) {
        // TODO: Reconsider throwing errors here. This causes a blank screen on error. Maybe I
        // should put them in `AuthStore`?
        // TODO: More gracefully handle common Firebase auth errors.
        // See https://firebase.google.com/docs/reference/js/auth#autherrorcodes.
        // eslint-disable-next-line no-restricted-syntax
        throw prefixError(authCredentialResult.error, `Error signing in with email link`);
      }

      // Clear the email from local storage since we no longer need it.
      window.localStorage.removeItem('emailForSignIn');

      // Redirect to the root path.
      navigate(Urls.forRoot());
    };

    void go();
  }, [navigate, setLoggedInUser]);
  return null;
};

export const AuthSubscriptions: React.FC = () => {
  return (
    <>
      <AuthServiceSubscription />
      <PasswordlessAuthSubscription />
    </>
  );
};
