import type {User as FirebaseUser} from 'firebase/auth';
import {z} from 'zod';

import {parseZodResult, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeId} from '@shared/lib/utils.shared';

import type {Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {Consumer, Task} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a `LoggedInUser`'s unique identifier. Prefer this over plain strings.
 */
export type UserId = string & {readonly __brand: 'UserIdBrand'};

// TODO: This schema is not correct as UUID.
export const UserIdSchema = z.string().uuid();

/**
 * Creates a {@link UserId} from a plain string. Returns an error if the string is not valid.
 */
export function parseUserId(maybeUserId: string = makeId()): Result<UserId> {
  const parsedResult = parseZodResult(UserIdSchema, maybeUserId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user ID');
  }
  return makeSuccessResult(parsedResult.value as UserId);
}

/**
 * Strongly-typed type for an email address. Prefer this over plain strings.
 */
export type EmailAddress = string & {readonly __brand: 'EmailAddressBrand'};

// TODO: Should I have a zod schema for these?

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

  const userIdResult = parseUserId(firebaseLoggedInUser.uid);
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
