import {onAuthStateChanged as onAuthStateChangedFirebase} from 'firebase/auth';

import {auth} from '@shared/lib/firebase';

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
      // Fire each subscriber's success callback when the user changes in Firebase.
      currentUser = firebaseUser ? makeLoggedInUserFromFirebaseUser(firebaseUser) : null;
      subscribers.forEach((cb) => cb.successCallback(currentUser));
    },
    (error) => {
      // Fire each subscriber's error callback when auth state errors occur in Firebase.
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
  };
}

export const authService = createAuthService();
