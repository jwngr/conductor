import dotenv from 'dotenv';

import {logger} from '@shared/services/logger.shared';

import {isValidPort} from '@shared/lib/utils.shared';

dotenv.config();

export function getRssServerPortFromEnv(): number {
  const RSS_SERVER_PORT = parseInt(process.env.LOCAL_RSS_FEED_PROVIDER_PORT ?? '', 10);
  if (isNaN(RSS_SERVER_PORT) || !isValidPort(RSS_SERVER_PORT)) {
    logger.error(new Error('Set LOCAL_RSS_FEED_PROVIDER_PORT to a valid port number in .env'), {
      port: RSS_SERVER_PORT,
    });
    process.exit(1);
  }
  return RSS_SERVER_PORT;
}
