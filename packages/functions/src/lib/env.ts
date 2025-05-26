import {projectID} from 'firebase-functions/params';

// TODO: Make region an environment variable.
export const FIREBASE_FUNCTIONS_REGION = 'us-central1';

export function getFunctionsBaseUrl(): string {
  return `https://${FIREBASE_FUNCTIONS_REGION}-${projectID.value()}.cloudfunctions.net`;
}
