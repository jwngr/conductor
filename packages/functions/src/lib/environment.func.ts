import {defineString, projectID} from 'firebase-functions/params';

import {logger} from '@shared/services/logger.shared';

import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {EmailAddress} from '@shared/types/emails.types';

// TODO: Make region an environment variable.
export const FIREBASE_FUNCTIONS_REGION = 'us-central1';

export function getFunctionsBaseUrl(): string {
  return `https://${FIREBASE_FUNCTIONS_REGION}-${projectID.value()}.cloudfunctions.net`;
}

let cachedInternalAccountEmailAddress: EmailAddress | undefined;
export function getInternalAccountEmailAddress(): EmailAddress {
  if (cachedInternalAccountEmailAddress) {
    return cachedInternalAccountEmailAddress;
  }

  const parsedInternalAccountEmailAddress = parseEmailAddress(
    defineString('INTERNAL_ACCOUNT_EMAIL_ADDRESS').value()
  );

  if (!parsedInternalAccountEmailAddress.success) {
    const message =
      'INTERNAL_ACCOUNT_EMAIL_ADDRESS environment variable is not a valid email address';
    const error = new Error(message);
    logger.error(error);
    // Consider this a fatal error.
    // eslint-disable-next-line no-restricted-syntax
    throw error;
  }

  cachedInternalAccountEmailAddress = parsedInternalAccountEmailAddress.value;
  return cachedInternalAccountEmailAddress;
}
