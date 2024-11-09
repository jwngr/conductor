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
  const currentUser: LoggedInUser | null = null;
  const subscribers = new Set<{
    readonly successCallback: AuthStateChangedCallback;
    readonly errorCallback: Consumer<Error>;
  }>();

  onAuthStateChangedFirebase(
    auth,
    (firebaseUser) => {
      if (!firebaseUser) return null;
      const loggedInUserResult = makeLoggedInUserFromFirebaseUser(firebaseUser);
      // Fire subscriber's callbacks based on the result. This should almost always be successful,
      // but due to strict type safety, we need to check the result from Firebase.
      if (loggedInUserResult.success) {
        subscribers.forEach((cb) => cb.successCallback(loggedInUserResult.value));
      } else {
        const betterError = new Error('Failed to create logged in user from Firebase user', {
          cause: loggedInUserResult.error,
        });
        subscribers.forEach((cb) => cb.errorCallback(betterError));
      }
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
