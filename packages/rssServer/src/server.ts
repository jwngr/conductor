import {serve} from '@hono/node-server';

import {logger} from '@shared/services/logger.shared';

import {prefixError, upgradeUnknownError} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';

import {getRssServerPortFromEnv} from '@src/lib/env';
import {InMemoryRssFeedManager} from '@src/lib/feedManager';
import {setupRoutes} from '@src/lib/routes';

async function main(): AsyncResult<void> {
  const feedManager = new InMemoryRssFeedManager();
  const app = setupRoutes(feedManager);
  const port = getRssServerPortFromEnv();

  return new Promise((resolve) => {
    serve(
      // eslint-disable-next-line no-restricted-syntax
      {port, fetch: app.fetch},
      (info) => {
        logger.log(`RSS server running on port ${info.port}`);
        resolve(makeSuccessResult(undefined));
      }
    );
  });
}

// eslint-disable-next-line no-restricted-syntax
try {
  await main();
} catch (error) {
  logger.error(prefixError(upgradeUnknownError(error), 'Error starting RSS server'));
  process.exit(1);
}
