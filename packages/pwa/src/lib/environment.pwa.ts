import {prettifyError} from 'zod/v4';

import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {Result} from '@shared/types/results.types';

import type {PWAEnvironmentVariables} from '@src/types/environment.pwa.types';
import {PWAEnvironmentVariablesSchema} from '@src/types/environment.pwa.types';

function getEnvironmentVariables(): Result<PWAEnvironmentVariables, Error> {
  const parsedEnvResult = PWAEnvironmentVariablesSchema.safeParse(import.meta.env);
  if (!parsedEnvResult.success) {
    const zodErrorMessage = prettifyError(parsedEnvResult.error);
    return makeErrorResult(new Error(`Failed to parse environment variables: ${zodErrorMessage}`));
  }

  const parsedEmailAddressResult = parseEmailAddress(
    parsedEnvResult.data.VITE_DEFAULT_PASSWORDLESS_EMAIL_ADDRESS
  );
  if (!parsedEmailAddressResult.success) {
    const message = 'VITE_DEFAULT_PASSWORDLESS_EMAIL_ADDRESS is not a valid email address';
    return prefixErrorResult(parsedEmailAddressResult, message);
  }

  return makeSuccessResult({
    mode: parsedEnvResult.data.MODE,
    conductorUrl: parsedEnvResult.data.VITE_CONDUCTOR_URL,
    defaultPasswordlessEmailAddress: parsedEmailAddressResult.value,
    firebaseApiKey: parsedEnvResult.data.VITE_FIREBASE_API_KEY,
    firebaseAuthDomain: parsedEnvResult.data.VITE_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: parsedEnvResult.data.VITE_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: parsedEnvResult.data.VITE_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: parsedEnvResult.data.VITE_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: parsedEnvResult.data.VITE_FIREBASE_APP_ID,
    firebaseMeasurementId: parsedEnvResult.data.VITE_FIREBASE_MEASUREMENT_ID ?? null,
    firebaseUseEmulator: parsedEnvResult.data.VITE_FIREBASE_USE_EMULATOR,
  });
}

const envResult = getEnvironmentVariables();
if (!envResult.success) {
  logger.error(envResult.error);
  // Consider this a fatal error.
  // eslint-disable-next-line no-restricted-syntax
  throw envResult.error;
}

export const env = envResult.value;
export const IS_DEVELOPMENT = env.mode === 'development';
