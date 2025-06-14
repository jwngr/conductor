import dotenv from 'dotenv';
import {prettifyError} from 'zod/v4';

import {logger} from '@shared/services/logger.shared';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {isValidPort} from '@shared/lib/utils.shared';

import type {Result} from '@shared/types/results.types';

import type {RssServerEnvironmentVariables} from '@src/types/environment.rss.types';
import {RssServerEnvironmentVariablesSchema} from '@src/types/environment.rss.types';

dotenv.config();

function getEnvironmentVariables(): Result<RssServerEnvironmentVariables, Error> {
  const parsedEnvResult = RssServerEnvironmentVariablesSchema.safeParse({
    LOCAL_RSS_FEED_PROVIDER_PORT: Number(process.env.LOCAL_RSS_FEED_PROVIDER_PORT),
  });
  if (!parsedEnvResult.success) {
    const zodErrorMessage = prettifyError(parsedEnvResult.error);
    return makeErrorResult(new Error(`Failed to parse environment variables: ${zodErrorMessage}`));
  }
  return makeSuccessResult({
    port: parsedEnvResult.data.LOCAL_RSS_FEED_PROVIDER_PORT,
  });
}

const envResult = getEnvironmentVariables();
if (!envResult.success) {
  logger.error(envResult.error);
  process.exit(1);
}

const env = envResult.value;

if (!isValidPort(env.port)) {
  const message = 'LOCAL_RSS_FEED_PROVIDER_PORT environment variable must be a valid port number';
  logger.error(new Error(message), {port: env.port});
  process.exit(1);
}

export const rssServerPort = env.port;
