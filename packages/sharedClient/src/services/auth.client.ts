import type {
  ActionCodeSettings,
  Auth as FirebaseAuth,
  UserCredential as FirebaseUserCredential,
} from 'firebase/auth';
import {
  isSignInWithEmailLink as isSignInWithEmailLinkFirebase,
  onAuthStateChanged as onAuthStateChangedFirebase,
  sendSignInLinkToEmail as sendSignInLinkToEmailFirebase,
  signInWithEmailLink as signInWithEmailLinkFirebase,
  signOut as signOutFirebase,
} from 'firebase/auth';

import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';

import type {AuthStateChangedCallback} from '@shared/types/accounts.types';
import type {AsyncResult} from '@shared/types/result.types';
import type {Consumer, EmailAddress} from '@shared/types/utils.types';

import {firebaseService} from '@sharedClient/services/firebase.client';

import {parseLoggedInAccount} from '@sharedClient/types/accounts.client.types';
import type {LoggedInAccount} from '@sharedClient/types/accounts.client.types';

interface AuthServiceSubscriptionCallbacks {
  successCallback: AuthStateChangedCallback;
  errorCallback: Consumer<Error>;
}

/**
 * Service for interacting with authentication state. It contains limited profile information about
 * the currently logged in account.
 */
export class ClientAuthService {
  private currentAccount: LoggedInAccount | null = null;
  private subscribers = new Set<AuthServiceSubscriptionCallbacks>();

  constructor(private auth: FirebaseAuth) {
    onAuthStateChangedFirebase(
      this.auth,
      (firebaseUser) => {
        // Fire subscriber's callbacks with null if not logged in.
        if (firebaseUser === null) {
          this.currentAccount = null;
          this.subscribers.forEach((cb) => cb.successCallback(null));
          return;
        }

        // Validate a logged in account can be created from the Firebase user. Fire subscriber's
        // callbacks with an error if we cannot.
        const loggedInAccountResult = parseLoggedInAccount(firebaseUser);
        if (!loggedInAccountResult.success) {
          this.currentAccount = null;
          const betterError = prefixError(
            loggedInAccountResult.error,
            'Failed to parse logged in account from Firebase user'
          );
          this.subscribers.forEach((cb) => cb.errorCallback(betterError));
          return;
        }

        // Otherwise, fire subscriber's success callbacks with the logged in account.
        this.currentAccount = loggedInAccountResult.value;
        this.subscribers.forEach((cb) => cb.successCallback(loggedInAccountResult.value));
      },
      (error) => {
        // Fire each subscriber's error callback when auth state errors occur in Firebase.
        this.currentAccount = null;
        this.subscribers.forEach((cb) => cb.errorCallback(error));
      }
    );
  }

  /**
   * Returns the currently logged-in account. Returns `null` if not logged in.
   */
  public getLoggedInAccount(): LoggedInAccount | null {
    return this.currentAccount;
  }

  /**
   * Registers a callback to be notified of future auth state changes. Fires immediately with
   * the currently logged in account. Fired with `null` if not logged in.
   */
  public onAuthStateChanged(callbacks: AuthServiceSubscriptionCallbacks): () => void {
    // Immediately call with current account if available.
    if (this.currentAccount) {
      callbacks.successCallback(this.currentAccount);
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
  ): AsyncResult<FirebaseUserCredential> {
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
