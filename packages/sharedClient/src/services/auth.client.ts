import type {ActionCodeSettings, Auth as FirebaseAuth, UserCredential} from 'firebase/auth';
import {
  isSignInWithEmailLink as isSignInWithEmailLinkFirebase,
  onAuthStateChanged as onAuthStateChangedFirebase,
  sendSignInLinkToEmail as sendSignInLinkToEmailFirebase,
  signInWithEmailLink as signInWithEmailLinkFirebase,
  signOut as signOutFirebase,
} from 'firebase/auth';

import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';

import {parseFirebaseUser} from '@shared/parsers/user.parser';

import type {AsyncResult} from '@shared/types/result.types';
import type {AuthStateChangedCallback, EmailAddress, User} from '@shared/types/user.types';
import type {Consumer} from '@shared/types/utils.types';

import {firebaseService} from '@sharedClient/services/firebase.client';

interface AuthServiceSubscriptionCallbacks {
  successCallback: AuthStateChangedCallback;
  errorCallback: Consumer<Error>;
}

/**
 * Service for interacting with authentication state. It contains limited profile information about
 * the currently logged in user.
 */
export class ClientAuthService {
  private currentUser: User | null = null;
  private subscribers = new Set<AuthServiceSubscriptionCallbacks>();

  constructor(private auth: FirebaseAuth) {
    onAuthStateChangedFirebase(
      this.auth,
      (firebaseUser) => {
        // Fire subscriber's callbacks with null if the user is not logged in.
        if (firebaseUser === null) {
          this.currentUser = null;
          this.subscribers.forEach((cb) => cb.successCallback(null));
          return;
        }

        // Validate a logged in user can be created from the Firebase user. Fire subscriber's
        // callbacks with an error if we cannot.
        const loggedInUserResult = parseFirebaseUser(firebaseUser);
        if (!loggedInUserResult.success) {
          this.currentUser = null;
          const betterError = prefixError(
            loggedInUserResult.error,
            'Failed to create logged in user from Firebase user'
          );
          this.subscribers.forEach((cb) => cb.errorCallback(betterError));
          return;
        }

        // Otherwise, fire subscriber's success callbacks with the logged in user.
        this.currentUser = loggedInUserResult.value;
        this.subscribers.forEach((cb) => cb.successCallback(loggedInUserResult.value));
      },
      (error) => {
        // Fire each subscriber's error callback when auth state errors occur in Firebase.
        this.currentUser = null;
        this.subscribers.forEach((cb) => cb.errorCallback(error));
      }
    );
  }

  /**
   * Returns the logged in user. Returns null if the user is not logged in.
   */
  public getLoggedInUser(): User | null {
    return this.currentUser;
  }

  /**
   * Registers a callback to be notified of future auth state changes. Fires immediately with
   * the currently logged in user. Fired with null if the user is not logged in.
   */
  public onAuthStateChanged(callbacks: AuthServiceSubscriptionCallbacks): () => void {
    // Immediately call with current user if available.
    if (this.currentUser) {
      callbacks.successCallback(this.currentUser);
    }

    // Register callback to be notified of future auth state changes.
    this.subscribers.add(callbacks);

    // Return a function to unregister the callback.
    return () => this.subscribers.delete(callbacks);
  }

  public isSignInWithEmailLink(url: string): boolean {
    return isSignInWithEmailLinkFirebase(this.auth, url);
  }

  public async signInWithEmailLink(
    email: EmailAddress,
    emailLink: string
  ): AsyncResult<UserCredential> {
    return await asyncTry(async () => signInWithEmailLinkFirebase(this.auth, email, emailLink));
  }

  public async sendSignInLinkToEmail(
    email: EmailAddress,
    actionCodeSettings: ActionCodeSettings
  ): AsyncResult<void> {
    return await asyncTry(async () =>
      sendSignInLinkToEmailFirebase(this.auth, email, actionCodeSettings)
    );
  }

  public async signOut(): AsyncResult<void> {
    return await asyncTry(async () => signOutFirebase(this.auth));
  }
}

export const authService = new ClientAuthService(firebaseService.auth);
