import type {User as FirebaseUser} from 'firebase/auth';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {EmailAddress, User, UserFromStorage, UserId} from '@shared/types/user.types';
import {EmailAddressSchema, UserFromStorageSchema, UserIdSchema} from '@shared/types/user.types';

/**
 * Parses a {@link UserId} from a plain string. Returns an `ErrorResult` if the string is not valid.
 */
export function parseUserId(maybeUserId: string): Result<UserId> {
  const parsedResult = parseZodResult(UserIdSchema, maybeUserId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user ID');
  }
  return makeSuccessResult(parsedResult.value as UserId);
}

/**
 * Parses a generic {@link User} from a an unknown object. Returns an `ErrorResult` if the
 * object is not valid.
 */
export function parseUser(maybeUser: unknown): Result<User> {
  const parsedResult = parseZodResult(UserFromStorageSchema, maybeUser);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user');
  }

  const parsedUserIdResult = parseUserId(parsedResult.value.userId);
  if (!parsedUserIdResult.success) return makeErrorResult(parsedUserIdResult.error);

  const parsedEmailResult = parseEmailAddress(parsedResult.value.email);
  if (!parsedEmailResult.success) return makeErrorResult(parsedEmailResult.error);

  return makeSuccessResult({
    userId: parsedUserIdResult.value,
    email: parsedEmailResult.value,
    displayName: parsedResult.value.displayName,
  });
}

/**
 * Parses an {@link EmailAddress} from a plain string. Returns an `ErrorResult` if the string is not
 * valid.
 */
export function parseEmailAddress(maybeEmail: string): Result<EmailAddress> {
  const parsedResult = parseZodResult(EmailAddressSchema, maybeEmail);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid email address');
  }
  return makeSuccessResult(parsedResult.value as EmailAddress);
}

/**
 * Parses a generic {@link User} from a Firebase-specific {@link FirebaseUser}. Returns an
 */
export function parseFirebaseUser(firebaseLoggedInUser: FirebaseUser): Result<User> {
  if (!firebaseLoggedInUser.email) {
    return makeErrorResult(new Error('No email address associated with Firebase user'));
  }

  const emailResult = parseEmailAddress(firebaseLoggedInUser.email);
  if (!emailResult.success) return makeErrorResult(emailResult.error);

  const userIdResult = parseUserId(firebaseLoggedInUser.uid);
  if (!userIdResult.success) return makeErrorResult(userIdResult.error);

  return makeSuccessResult({
    userId: userIdResult.value,
    email: emailResult.value,
    displayName: firebaseLoggedInUser.displayName ?? undefined,
  });
}

export function toFirestoreUser(user: User): UserFromStorage {
  return {
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
  };
}
