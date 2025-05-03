import {useNavigate} from '@tanstack/react-router';
import {isSignInWithEmailLink} from 'firebase/auth';
import {useEffect} from 'react';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseEmailAddress} from '@shared/parsers/accounts.parser';

import {useAuthStore} from '@sharedClient/stores/AuthStore';

import {authService} from '@sharedClient/services/auth.client';
import {firebaseService} from '@sharedClient/services/firebase.client';

import {rootRoute} from '@src/routes/__root';

const AuthServiceSubscription: React.FC = () => {
  const {setLoggedInAccount} = useAuthStore();
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged({
      successCallback: (loggedInAccount) => {
        logger.log('Auth service auth state changed', {loggedInAccount});
        setLoggedInAccount(loggedInAccount);
      },
      errorCallback: (error) => {
        logger.error(prefixError(error, 'Auth service `onAuthStateChanged` listener errored'));
      },
    });
    return () => unsubscribe();
  }, [setLoggedInAccount]);
  return null;
};

const PasswordlessAuthSubscription: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const go = async (): Promise<void> => {
      // Only do something if the current URL is a "sign-in with email" link.
      if (!isSignInWithEmailLink(firebaseService.auth, window.location.href)) return;

      // The sign in screen persisted the email to login in local storage. If the sign-in link was
      // opened using the same browser as the one used to sign in, this value will be present.
      let maybeEmail = window.localStorage.getItem('emailForSignIn');

      if (!maybeEmail) {
        // The email is not available in local storage. Most likely, the sign-in link was opened on
        // a different device or browser session than it was generated from. In this scenario,
        // re-prompt for the email.
        // TODO: Replace this prompt with something nicer.
        maybeEmail = window.prompt('Please provide your email for confirmation');
      }

      const emailResult = parseEmailAddress(maybeEmail ?? '');

      // Log and error, but do nothing else if we don't have a valid email.
      if (!emailResult.success) {
        logger.error(new Error('Invalid email provided for passwordless sign-in'), {
          email: maybeEmail,
        });
        return;
      }

      const email = emailResult.value;

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

      // Authentication successful. `AuthStore` will be updated via `AuthServiceSubscription`.

      // Clear the email from local storage since we no longer need it.
      window.localStorage.removeItem('emailForSignIn');

      // Redirect to the root path.
      await navigate({to: rootRoute.fullPath});
    };

    void go();
  }, [navigate]);
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
