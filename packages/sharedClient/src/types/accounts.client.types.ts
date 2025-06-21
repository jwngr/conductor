import type {User as FirebaseUser} from 'firebase/auth';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {EmailAddress} from '@shared/types/emails.types';
import type {AccountId} from '@shared/types/ids.types';
import type {Result} from '@shared/types/results.types';

/**
 * A generic type representing the account who is currently logged in.
 */
export interface LoggedInAccount {
  readonly accountId: AccountId;
  readonly email: EmailAddress;
  readonly displayName?: string;
  readonly createdTime: Date | undefined;
  readonly lastSignInTime: Date | undefined;
  // TODO: Add photo URL.
}

/**
 * Parses a generic {@link LoggedInAccount} from a Firebase-specific {@link FirebaseUser}.
 */
export function parseLoggedInAccount(
  firebaseLoggedInUser: FirebaseUser
): Result<LoggedInAccount, Error> {
  if (!firebaseLoggedInUser.email) {
    return makeErrorResult(new Error('Firebase user has no email address'));
  }

  const emailResult = parseEmailAddress(firebaseLoggedInUser.email);
  if (!emailResult.success) return emailResult;

  const accountIdResult = parseAccountId(firebaseLoggedInUser.uid);
  if (!accountIdResult.success) return accountIdResult;

  return makeSuccessResult({
    accountId: accountIdResult.value,
    email: emailResult.value,
    displayName: firebaseLoggedInUser.displayName ?? undefined,
    createdTime: firebaseLoggedInUser.metadata.creationTime
      ? new Date(firebaseLoggedInUser.metadata.creationTime)
      : undefined,
    lastSignInTime: firebaseLoggedInUser.metadata.lastSignInTime
      ? new Date(firebaseLoggedInUser.metadata.lastSignInTime)
      : undefined,
  });
}
