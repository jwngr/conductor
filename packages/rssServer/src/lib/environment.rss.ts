import dotenv from 'dotenv';

import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {isValidPort} from '@shared/lib/utils.shared';

import type {Result} from '@shared/types/results.types';

import type {RssServerEnvironmentVariables} from '@src/types/environment.rss.types';
import {RssServerEnvironmentVariablesSchema} from '@src/types/environment.rss.types';

dotenv.config();

function getEnvironmentVariables(): Result<RssServerEnvironmentVariables, Error> {
  const parsedEnvResult = parseZodResult(RssServerEnvironmentVariablesSchema, {
    LOCAL_RSS_FEED_PROVIDER_PORT: Number(process.env.LOCAL_RSS_FEED_PROVIDER_PORT),
  });
  if (!parsedEnvResult.success) {
    return prefixErrorResult(parsedEnvResult, 'Failed to parse environment variables');
  }
  const env = parsedEnvResult.value;

  return makeSuccessResult({
    port: env.LOCAL_RSS_FEED_PROVIDER_PORT,
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
