import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {Result} from '@shared/types/results.types';

import type {PWAEnvironmentVariables} from '@src/types/environment.pwa.types';
import {PWAEnvironmentVariablesSchema} from '@src/types/environment.pwa.types';

function getEnvironmentVariables(): Result<PWAEnvironmentVariables, Error> {
  const parsedEnvResult = parseZodResult(PWAEnvironmentVariablesSchema, import.meta.env);
  if (!parsedEnvResult.success) {
    return prefixErrorResult(parsedEnvResult, 'Failed to parse environment variables');
  }
  const env = parsedEnvResult.value;

  const parsedEmailAddressResult = parseEmailAddress(env.VITE_DEFAULT_PASSWORDLESS_EMAIL_ADDRESS);
  if (!parsedEmailAddressResult.success) {
    const message = 'VITE_DEFAULT_PASSWORDLESS_EMAIL_ADDRESS is not a valid email address';
    return prefixErrorResult(parsedEmailAddressResult, message);
  }
  const defaultPasswordlessEmailAddress = parsedEmailAddressResult.value;

  return makeSuccessResult({
    defaultPasswordlessEmailAddress,
    mode: env.MODE,
    conductorUrl: env.VITE_CONDUCTOR_URL,
    firebaseApiKey: env.VITE_FIREBASE_API_KEY,
    firebaseAuthDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: env.VITE_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: env.VITE_FIREBASE_APP_ID,
    firebaseMeasurementId: env.VITE_FIREBASE_MEASUREMENT_ID ?? null,
    firebaseUseEmulator: env.VITE_FIREBASE_USE_EMULATOR,
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
