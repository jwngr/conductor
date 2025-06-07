import dotenv from 'dotenv';

import {logger} from '@shared/services/logger.shared';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {isValidPort} from '@shared/lib/utils.shared';

import type {Result} from '@shared/types/results.types';

import type {RssServerEnvironmentVariables} from '@src/types/environment.rss.types';
import {RssServerEnvironmentVariablesSchema} from '@src/types/environment.rss.types';

dotenv.config();

function getEnvironmentVariables(): Result<RssServerEnvironmentVariables, Error> {
  const parsedEnvResult = RssServerEnvironmentVariablesSchema.safeParse(process.env);
  if (!parsedEnvResult.success) {
    return makeErrorResult(new Error('Failed to parse environment variables'));
  }
  return makeSuccessResult(parsedEnvResult.data as RssServerEnvironmentVariables);
}

const envResult = getEnvironmentVariables();
if (!envResult.success) {
  logger.error(envResult.error);
  process.exit(1);
}

const env = envResult.value;

if (!isValidPort(env.LOCAL_RSS_FEED_PROVIDER_PORT)) {
  const message = 'LOCAL_RSS_FEED_PROVIDER_PORT environment variable must be a valid port number';
  logger.error(new Error(message), {port: env.LOCAL_RSS_FEED_PROVIDER_PORT});
  process.exit(1);
}

export const rssServerPort = env.LOCAL_RSS_FEED_PROVIDER_PORT;
