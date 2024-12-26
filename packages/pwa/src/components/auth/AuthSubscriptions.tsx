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

import {navigateToErrorPage} from '@src/lib/error.pwa';

const AuthServiceSubscription: React.FC = () => {
  const {setLoggedInUser} = useAuthStore();
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged({
      successCallback: (loggedInUser) => {
        logger.log('Logged-in user state changed', {loggedInUser});
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
  useEffect(() => {
    const go = async () => {
      // Only do something if the current URL is a "sign-in with email" link.
      if (!isSignInWithEmailLink(firebaseService.auth, window.location.href)) return;

      // The sign in screen persisted the email to login in local storage. If the user opened the
      // link on the same browser as the one used to sign in, this value will be present.
      let maybeEmail = window.localStorage.getItem('emailForSignIn');

      if (!maybeEmail) {
        // If the user opened the link on a different device, ask them for the email again.
        // TODO: Replace this prompt with something nicer.
        maybeEmail = window.prompt('Please provide your email for confirmation');
      }

      // Do nothing if the user didn't provide a valid email.
      if (!isValidEmail(maybeEmail)) {
        logger.log('Invalid email provided for passwordless sign-in', {email: maybeEmail});
        navigateToErrorPage(new Error('Invalid email provided for passwordless sign-in'), navigate);
        return;
      }

      console.log('MESSING THINGS UP');
      navigateToErrorPage(new Error('MESSING THINGS UP'), navigate);
      return;
      const email = maybeEmail;

      const authCredentialResult = await authService.signInWithEmailLink(
        email,
        window.location.href
      );

      if (!authCredentialResult.success) {
        // TODO: More gracefully handle common Firebase auth errors.
        // See https://firebase.google.com/docs/reference/js/auth#autherrorcodes.
        const error = new Error(
          `Error signing in with email link: ${authCredentialResult.error.message}`,
          {
            cause: authCredentialResult.error,
          }
        );
        navigateToErrorPage(error, navigate);
        return;
      }

      // Clear the email from local storage since we no longer need it.
      window.localStorage.removeItem('emailForSignIn');

      // Redirect to the root path.
      console.log('Navigating to root path AAA');
      navigate(Urls.forRoot());
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
