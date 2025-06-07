import {logger} from '@shared/services/logger.shared';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';

import type {PWAEnvironmentVariables} from '@src/types/environment.pwa.types';
import {PWAEnvironmentVariablesSchema} from '@src/types/environment.pwa.types';

function getEnvironmentVariables(): Result<PWAEnvironmentVariables, Error> {
  const parsedEnvResult = PWAEnvironmentVariablesSchema.safeParse(import.meta.env);
  if (!parsedEnvResult.success) {
    return makeErrorResult(new Error('Failed to parse environment variables'));
  }
  return makeSuccessResult(parsedEnvResult.data as PWAEnvironmentVariables);
}

const envResult = getEnvironmentVariables();
if (!envResult.success) {
  logger.error(envResult.error);
  // Consider this a fatal error.
  // eslint-disable-next-line no-restricted-syntax
  throw envResult.error;
}

export const env = envResult.value;
export const IS_DEVELOPMENT = env.DEV;
