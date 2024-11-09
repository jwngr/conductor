import {User as FirebaseUser} from 'firebase/auth';

import {makeErrorResult, makeSuccessResult, Result} from '@shared/types/result.types';
import {Consumer, Task} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a user's unique identifier. Prefer this over plain strings.
 */
export type UserId = string & {readonly __brand: 'UserIdBrand'};

/**
 * Checks if a value is a valid `UserId`.
 */
export function isValidUserId(maybeUserId: unknown): maybeUserId is UserId {
  return typeof maybeUserId === 'string' && maybeUserId.length > 0;
}

/**
 * Creates a `UserId` from a plain string. Returns an error if the string is not a valid `UserId`.
 */
export function createUserId(maybeUserId: string): Result<UserId> {
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
 * Creates an `EmailAddress` from a plain string. Returns an error if the string is not a valid
 * `EmailAddress`.
 */
export function createEmailAddress(maybeEmail: string): Result<EmailAddress> {
  if (!isValidEmail(maybeEmail)) {
    return makeErrorResult(new Error('Invalid email address format'));
  }
  // TODO: Should we normalize email addresses?
  return makeSuccessResult(maybeEmail);
}

export interface LoggedInUser {
  readonly userId: UserId;
  readonly email: EmailAddress | null;
  readonly displayName: string | null;
  // TODO: Add photo URL.
  // readonly photoUrl: string;
}

/**
 * Create a generic `LoggedInUser` from a Firebase-specific `FirebaseUser`.
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

  const userIdResult = createUserId(firebaseLoggedInUser.uid);
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

/**
 * Service for interacting with authentication state.
 */
export interface AuthService {
  getLoggedInUser: () => LoggedInUser | null;
  onAuthStateChanged: (callbacks: {
    successCallback: AuthStateChangedCallback;
    errorCallback: Consumer<Error>;
  }) => AuthStateChangedUnsubscribe;
}
