import {defineString, projectID} from 'firebase-functions/params';

import type {EmailAddress} from '@shared/types/emails.types';

// TODO: Make region an environment variable.
export const FIREBASE_FUNCTIONS_REGION = 'us-central1';

export function getFunctionsBaseUrl(): string {
  return `https://${FIREBASE_FUNCTIONS_REGION}-${projectID.value()}.cloudfunctions.net`;
}

export const INTERNAL_ACCOUNT_EMAIL_ADDRESS = defineString(
  'INTERNAL_ACCOUNT_EMAIL_ADDRESS'
).value() as EmailAddress;
