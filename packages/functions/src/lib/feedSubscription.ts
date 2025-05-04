import {HttpsError} from 'firebase-functions/v2/https';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

import type {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';

export async function subscribeAccountToFeedHelper(args: {
  readonly auth: {readonly uid: string} | undefined;
  readonly data: unknown;
  readonly rssFeedService: ServerRssFeedService;
}): Promise<{readonly userFeedSubscriptionId: UserFeedSubscriptionId}> {
  const {auth, data, rssFeedService} = args;

  if (!auth) {
    // eslint-disable-next-line no-restricted-syntax
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  } else if (
    !data ||
    typeof data !== 'object' ||
    !('url' in data) ||
    typeof data.url !== 'string'
  ) {
    // eslint-disable-next-line no-restricted-syntax
    throw new HttpsError('invalid-argument', 'URL is required');
  }

  const accountIdResult = parseAccountId(auth.uid);
  if (!accountIdResult.success) {
    // eslint-disable-next-line no-restricted-syntax
    throw new HttpsError('invalid-argument', 'Invalid account ID');
  }
  const accountId = accountIdResult.value;

  const {url} = data;
  const logDetails = {url, accountId} as const;

  logger.log(`[SUBSCRIBE] Subscribing account to feed source via URL...`, logDetails);

  const subscribeToUrlResult = await rssFeedService.subscribeAccountToUrl({url, accountId});
  if (!subscribeToUrlResult.success) {
    logger.error(
      prefixError(
        subscribeToUrlResult.error,
        '[SUBSCRIBE] Error subscribing account to feed source via URL'
      ),
      logDetails
    );
    // eslint-disable-next-line no-restricted-syntax
    throw new HttpsError('internal', subscribeToUrlResult.error.message);
  }

  const userFeedSubscription = subscribeToUrlResult.value;

  logger.log(`[SUBSCRIBE] Successfully subscribed account to feed source`, {
    ...logDetails,
    feedSourceId: userFeedSubscription.feedSourceId,
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  });

  return {
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
  };
}
