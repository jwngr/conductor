import {HttpsError} from 'firebase-functions/v2/https';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {SubscribeAccountToRSSFeedOnCallResponse} from '@shared/types/api.types';

import type {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';

export async function handleSubscribeAccountToRssFeed(args: {
  readonly accountId: AccountId;
  readonly parsedUrl: URL;
  readonly rssFeedService: ServerRssFeedService;
}): Promise<SubscribeAccountToRSSFeedOnCallResponse> {
  const {accountId, parsedUrl, rssFeedService} = args;
  const url = parsedUrl.href;

  const innerLog = (message: string, details: Record<string, unknown> = {}): void => {
    logger.log(`[SUBSCRIBE] ${message}`, {url, accountId, ...details});
  };

  const innerLogError = (error: Error, prefix: string): void => {
    logger.error(prefixError(error, prefix), {url, accountId});
  };

  innerLog('Subscribing account to RSS feed source...');

  const subscribeToUrlResult = await rssFeedService.subscribeToRssFeedByUrl(url);
  if (!subscribeToUrlResult.success) {
    innerLogError(subscribeToUrlResult.error, 'Error subscribing account to RSS feed URL');
    // eslint-disable-next-line no-restricted-syntax
    throw new HttpsError('internal', subscribeToUrlResult.error.message);
  }

  const miniFeedSource = subscribeToUrlResult.value;

  innerLog('Successfully subscribed account to feed source', {miniFeedSource});

  return {miniFeedSource};
}
