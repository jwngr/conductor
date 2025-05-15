import dotenv from 'dotenv';

import {logger} from '@shared/services/logger.shared';

dotenv.config();

export function getRssServerPortFromEnv(): number {
  const RSS_SERVER_PORT = parseInt(process.env.LOCAL_RSS_FEED_PROVIDER_PORT ?? '', 10);
  if (isNaN(RSS_SERVER_PORT)) {
    logger.error(new Error('LOCAL_RSS_FEED_PROVIDER_PORT must be set as a valid port in .env'), {
      port: RSS_SERVER_PORT,
    });
    process.exit(1);
  }
  return RSS_SERVER_PORT;
}
