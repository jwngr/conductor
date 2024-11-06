import {isSignInWithEmailLink, signInWithEmailLink} from 'firebase/auth';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import {auth} from '@shared/lib/firebase';
import {logger} from '@shared/lib/logger';
import {Urls} from '@shared/lib/urls';

import {authService} from '@shared/services/authService';

import {useAuthStore} from '@src/stores/AuthStore';

const AuthServiceSubscription: React.FC = () => {
  const {setLoggedInUser} = useAuthStore();
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged({
      successCallback: (loggedInUser) => {
        logger.log('User service auth state changed', {loggedInUser});
        setLoggedInUser(loggedInUser);
      },
      errorCallback: (error) => {
        logger.error('User service `onAuthStateChanged` listener errored', {error});
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
      if (!isSignInWithEmailLink(auth, window.location.href)) return;

      // The sign in screen persisted the email to login in local storage. If the user opened the
      // link on the same browser as the one used to sign in, this value will be present.
      let email = window.localStorage.getItem('emailForSignIn');

      if (!email) {
        // If the user opened the link on a different device, ask them for the email again.
        // TODO: Replace this prompt with something nicer.
        email = window.prompt('Please provide your email for confirmation');
      }

      // Do nothing if the user didn't provide an email.
      if (!email) return;

      try {
        const authResult = await signInWithEmailLink(auth, email, window.location.href);
        if (authResult.user) {
          // Clear the email from local storage since we no longer need it.
          window.localStorage.removeItem('emailForSignIn');

          // Redirect to the root path.
          navigate(Urls.forRoot());
        }
      } catch (error) {
        // TODO: Reconsider throwing errors here. Maybe I should put them in `AuthStore`.
        if (error instanceof Error) {
          // TODO: More gracefull handle common Firebase auth errors.
          // See https://firebase.google.com/docs/reference/js/auth#autherrorcodes.
          throw new Error(`Error signing in with email link: ${error.message}`, {cause: error});
        } else {
          throw new Error(`Error signing in with email link: ${error}`);
        }
      }
    };
    go();
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
