import type {User as FirebaseUser} from 'firebase/auth';

import {parseZodResult, prefixErrorResult} from '@shared/lib/errorUtils.shared';

import type {Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {EmailAddress, LoggedInUser, UserId} from '@shared/types/user.types';
import {EmailAddressSchema, UserIdSchema} from '@shared/types/user.types';

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
 * Parses a generic {@link LoggedInUser} from a Firebase-specific {@link FirebaseUser}. Returns an
 */
export function parseFirebaseUser(firebaseLoggedInUser: FirebaseUser): Result<LoggedInUser> {
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
    displayName: firebaseLoggedInUser.displayName,
  });
}
