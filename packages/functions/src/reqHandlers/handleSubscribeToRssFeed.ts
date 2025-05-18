import {HttpsError} from 'firebase-functions/v2/https';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import type {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';

export async function handleSubscribeToRssFeed(args: {
  readonly parsedUrl: URL;
  readonly rssFeedService: ServerRssFeedService;
}): Promise<void> {
  const {parsedUrl, rssFeedService} = args;
  const url = parsedUrl.href;

  const innerLog = (message: string, details: Record<string, unknown> = {}): void => {
    logger.log(`[SUBSCRIBE] ${message}`, {url, ...details});
  };

  const innerLogError = (error: Error, prefix: string): void => {
    logger.error(prefixError(error, `[SUBSCRIBE] ${prefix}`), {url});
  };

  innerLog('Subscribing to URL via RSS feed service...');

  const subscribeToUrlResult = await rssFeedService.subscribeToUrl(url);
  if (!subscribeToUrlResult.success) {
    innerLogError(subscribeToUrlResult.error, 'Error subscribing to URL via RSS feed service');
    // eslint-disable-next-line no-restricted-syntax
    throw new HttpsError('internal', subscribeToUrlResult.error.message);
  }

  innerLog('Successfully subscribed to URL via RSS feed service');

  return;
}
