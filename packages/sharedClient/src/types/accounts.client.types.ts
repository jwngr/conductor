import type {User as FirebaseUser} from 'firebase/auth';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {EmailAddress} from '@shared/types/emails.types';
import type {Result} from '@shared/types/results.types';

/**
 * A generic type representing the user who is currently logged in.
 */
export interface LoggedInAccount {
  readonly accountId: AccountId;
  readonly email: EmailAddress;
  readonly displayName?: string;
  // TODO: Add photo URL.
  // readonly photoUrl: string;
}

/**
 * Parses a generic {@link LoggedInAccount} from a Firebase-specific {@link FirebaseUser}. Returns
 * an `ErrorResult` if the user is not authenticated.
 */
export function parseLoggedInAccount(firebaseLoggedInUser: FirebaseUser): Result<LoggedInAccount> {
  if (!firebaseLoggedInUser.email) {
    return makeErrorResult(new Error('No email address associated with Firebase user'));
  }

  const emailResult = parseEmailAddress(firebaseLoggedInUser.email);
  if (!emailResult.success) return makeErrorResult(emailResult.error);

  const accountIdResult = parseAccountId(firebaseLoggedInUser.uid);
  if (!accountIdResult.success) return makeErrorResult(accountIdResult.error);

  return makeSuccessResult({
    accountId: accountIdResult.value,
    email: emailResult.value,
    displayName: firebaseLoggedInUser.displayName ?? undefined,
  });
}
