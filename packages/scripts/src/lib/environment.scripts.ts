import dotenv from 'dotenv';

import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {Result} from '@shared/types/results.types';

import type {ScriptsEnvironmentVariables} from '@src/types/environment.scripts.types';
import {ScriptsEnvironmentVariablesSchema} from '@src/types/environment.scripts.types';

dotenv.config();

function getEnvironmentVariables(): Result<ScriptsEnvironmentVariables, Error> {
  const parsedEnvResult = parseZodResult(ScriptsEnvironmentVariablesSchema, {
    LOCAL_EMAIL_ADDRESS: process.env.LOCAL_EMAIL_ADDRESS,
    GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
  });
  if (!parsedEnvResult.success) {
    return prefixErrorResult(parsedEnvResult, 'Failed to parse environment variables');
  }
  const env = parsedEnvResult.value;

  const parseEmailResult = parseEmailAddress(env.LOCAL_EMAIL_ADDRESS);
  if (!parseEmailResult.success) {
    const message = 'LOCAL_EMAIL_ADDRESS environment variable is not a valid email address';
    return prefixErrorResult(parseEmailResult, message);
  }
  const localEmailAddress = parseEmailResult.value;

  return makeSuccessResult({
    localEmailAddress,
    googleCloudProject: env.GOOGLE_CLOUD_PROJECT,
    firebaseProjectId: env.FIREBASE_PROJECT_ID,
    firecrawlApiKey: env.FIRECRAWL_API_KEY,
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
