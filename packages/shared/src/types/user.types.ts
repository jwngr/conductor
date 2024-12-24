import type {ActionCodeSettings, User as FirebaseUser, UserCredential} from 'firebase/auth';

import {makeId} from '@shared/lib/utils';

import type {AsyncResult, Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {Consumer, Func, Supplier, Task} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a `LoggedInUser`'s unique identifier. Prefer this over plain strings.
 */
export type UserId = string & {readonly __brand: 'UserIdBrand'};

/**
 * Checks if a value is a valid {@link UserId}.
 */
export function isValidUserId(maybeUserId: unknown): maybeUserId is UserId {
  return typeof maybeUserId === 'string' && maybeUserId.length > 0;
}

/**
 * Creates a {@link UserId} from a plain string. Returns an error if the string is not valid.
 */
export function makeUserId(maybeUserId: string = makeId()): Result<UserId> {
  if (!isValidUserId(maybeUserId)) {
    return makeErrorResult(new Error(`Invalid user ID: "${maybeUserId}"`));
  }
  return makeSuccessResult(maybeUserId);
}

/**
 * Strongly-typed type for an email address. Prefer this over plain strings.
 */
export type EmailAddress = string & {readonly __brand: 'EmailAddressBrand'};

/**
 * Checks if a value is a valid `EmailAddress`.
 */
export function isValidEmail(maybeEmail: unknown): maybeEmail is EmailAddress {
  return typeof maybeEmail === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(maybeEmail);
}

/**
 * Creates an {@link EmailAddress} from a plain string. Returns an error if the string is not valid.
 */
export function createEmailAddress(maybeEmail: string): Result<EmailAddress> {
  if (!isValidEmail(maybeEmail)) {
    return makeErrorResult(new Error(`Invalid email address format: "${maybeEmail}"`));
  }
  // TODO: Should we normalize email addresses?
  return makeSuccessResult(maybeEmail);
}

export interface LoggedInUser {
  readonly userId: UserId;
  readonly email: EmailAddress;
  readonly displayName: string | null;
  // TODO: Add photo URL.
  // readonly photoUrl: string;
}

/**
 * Create a generic {@link LoggedInUser} from a Firebase-specific {@link FirebaseUser}.
 */
export function makeLoggedInUserFromFirebaseUser(
  firebaseLoggedInUser: FirebaseUser
): Result<LoggedInUser> {
  if (!firebaseLoggedInUser.email) {
    return makeErrorResult(new Error('No email address associated with Firebase user'));
  }

  const emailResult = createEmailAddress(firebaseLoggedInUser.email);
  if (!emailResult.success) {
    return makeErrorResult(emailResult.error);
  }

  const userIdResult = makeUserId(firebaseLoggedInUser.uid);
  if (!userIdResult.success) {
    return makeErrorResult(userIdResult.error);
  }

  return makeSuccessResult({
    userId: userIdResult.value,
    email: emailResult.value,
    displayName: firebaseLoggedInUser.displayName,
  });
}

export type AuthStateChangedCallback = Consumer<LoggedInUser | null>;

export type AuthStateChangedUnsubscribe = Task;

interface AuthStateChangedCallbacks {
  successCallback: AuthStateChangedCallback;
  errorCallback: Consumer<Error>;
}

/**
 * Service for interacting with authentication state. It contains limited profile information about
 * the currently logged in user.
 */
export interface AuthService {
  getLoggedInUser: Supplier<LoggedInUser | null>;
  onAuthStateChanged: Func<AuthStateChangedCallbacks, AuthStateChangedUnsubscribe>;
  isSignInWithEmailLink: Func<string, boolean>;
  signInWithEmailLink: (email: EmailAddress, emailLink: string) => AsyncResult<UserCredential>;
  sendSignInLinkToEmail: (
    email: EmailAddress,
    actionCodeSettings: ActionCodeSettings
  ) => AsyncResult<void>;
  signOut: Supplier<AsyncResult<void>>;
}
