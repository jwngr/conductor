import dotenv from 'dotenv';
import {prettifyError} from 'zod/v4';

import {logger} from '@shared/services/logger.shared';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';

import type {ScriptsEnvironmentVariables} from '@src/types/environment.scripts.types';
import {ScriptsEnvironmentVariablesSchema} from '@src/types/environment.scripts.types';

dotenv.config();

function getEnvironmentVariables(): Result<ScriptsEnvironmentVariables, Error> {
  const parsedEnvResult = ScriptsEnvironmentVariablesSchema.safeParse({
    FIREBASE_USER_ID: process.env.FIREBASE_USER_ID,
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
    INTERNAL_ACCOUNT_EMAIL_ADDRESS: process.env.INTERNAL_ACCOUNT_EMAIL_ADDRESS,
  });
  if (!parsedEnvResult.success) {
    const zodErrorMessage = prettifyError(parsedEnvResult.error);
    return makeErrorResult(new Error(`Failed to parse environment variables: ${zodErrorMessage}`));
  }
  return makeSuccessResult({
    firebaseUserId: parsedEnvResult.data.FIREBASE_USER_ID,
    firecrawlApiKey: parsedEnvResult.data.FIRECRAWL_API_KEY,
    internalAccountEmailAddress: parsedEnvResult.data.INTERNAL_ACCOUNT_EMAIL_ADDRESS,
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
