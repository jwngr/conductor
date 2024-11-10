import {
  onAuthStateChanged as onAuthStateChangedFirebase,
  sendSignInLinkToEmail as sendSignInLinkToEmailFirebase,
  signInWithEmailLink as signInWithEmailLinkFirebase,
  signOut as signOutFirebase,
  UserCredential,
} from 'firebase/auth';

import {asyncTry} from '@shared/lib/errors';
import {auth} from '@shared/lib/firebase';

import {AsyncResult} from '@shared/types/result.types';
import {
  AuthService,
  AuthStateChangedCallback,
  LoggedInUser,
  makeLoggedInUserFromFirebaseUser,
} from '@shared/types/user.types';
import {Consumer} from '@shared/types/utils.types';

function createAuthService(): AuthService {
  let currentUser: LoggedInUser | null = null;
  const subscribers = new Set<{
    readonly successCallback: AuthStateChangedCallback;
    readonly errorCallback: Consumer<Error>;
  }>();

  onAuthStateChangedFirebase(
    auth,
    (firebaseUser) => {
      // Fire subscriber's callbacks with null if the user is not logged in.
      if (firebaseUser === null) {
        currentUser = null;
        subscribers.forEach((cb) => cb.successCallback(null));
        return;
      }

      // Validate a logged in user can be created from the Firebase user. Fire subscriber's
      // callbacks with an error if we cannot.
      const loggedInUserResult = makeLoggedInUserFromFirebaseUser(firebaseUser);
      if (!loggedInUserResult.success) {
        currentUser = null;
        const betterError = new Error('Failed to create logged in user from Firebase user', {
          cause: loggedInUserResult.error,
        });
        subscribers.forEach((cb) => cb.errorCallback(betterError));
        return;
      }

      // Otherwise, fire subscriber's success callbacks with the logged in user.
      currentUser = loggedInUserResult.value;
      subscribers.forEach((cb) => cb.successCallback(loggedInUserResult.value));
    },
    (error) => {
      // Fire each subscriber's error callback when auth state errors occur in Firebase.
      currentUser = null;
      subscribers.forEach((cb) => cb.errorCallback(error));
    }
  );

  return {
    /**
     * Returns the logged in user. Returns null if the user is not logged in.
     */
    getLoggedInUser: () => currentUser,

    /**
     * Registers a callback to be notified of future auth state changes. Fires immediately with
     * the currently logged in user. Fired with null if the user is not logged in.
     *
     * @returns A function to unregister the callback.
     */
    onAuthStateChanged: (callbacks) => {
      // Immediately call with current user if available.
      if (currentUser) {
        callbacks.successCallback(currentUser);
      }

      // Register callback to be notified of future auth state changes.
      subscribers.add(callbacks);

      // Return a function to unregister the callback.
      return () => {
        subscribers.delete(callbacks);
      };
    },

    signInWithEmailLink: async (email, emailLink): AsyncResult<UserCredential> => {
      return await asyncTry<UserCredential>(async () => {
        return await signInWithEmailLinkFirebase(auth, email, emailLink);
      });
    },

    sendSignInLinkToEmail: async (email, actionCodeSettings): AsyncResult<void> => {
      return await asyncTry(async () => {
        await sendSignInLinkToEmailFirebase(auth, email, actionCodeSettings);
      });
    },

    signOut: async (): AsyncResult<void> => {
      return await asyncTry(async () => {
        await signOutFirebase(auth);
      });
    },
  };
}

export const authService = createAuthService();
