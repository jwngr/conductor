import dotenv from 'dotenv';

import {logger} from '@shared/services/logger.shared';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';

import type {ScriptsEnvironmentVariables} from '@src/types/environment.scripts.types';
import {ScriptsEnvironmentVariablesSchema} from '@src/types/environment.scripts.types';

dotenv.config();

function getEnvironmentVariables(): Result<ScriptsEnvironmentVariables, Error> {
  const parsedEnvResult = ScriptsEnvironmentVariablesSchema.safeParse(process.env);
  if (!parsedEnvResult.success) {
    return makeErrorResult(new Error('Failed to parse environment variables'));
  }
  return makeSuccessResult(parsedEnvResult.data as ScriptsEnvironmentVariables);
}

const envResult = getEnvironmentVariables();
if (!envResult.success) {
  logger.error(envResult.error);
  // Consider this a fatal error.
  // eslint-disable-next-line no-restricted-syntax
  throw envResult.error;
}

export const env = envResult.value;
