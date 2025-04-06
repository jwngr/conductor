import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import {
  parseUserFeedSubscription,
  parseUserFeedSubscriptionId,
} from '@shared/parsers/userFeedSubscriptions.parser';

import type {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';

export async function handleFeedUnsubscribeHelper(args: {
  readonly userFeedSubscriptionId: string;
  readonly beforeData: unknown;
  readonly afterData: unknown;
  readonly rssFeedService: ServerRssFeedService;
}): Promise<void> {
  const {
    userFeedSubscriptionId: maybeUserFeedSubscriptionId,
    beforeData,
    afterData,
    rssFeedService,
  } = args;

  // Parse the user feed subscription ID.
  const parseIdResult = parseUserFeedSubscriptionId(maybeUserFeedSubscriptionId);
  if (!parseIdResult.success) {
    logger.error(
      prefixError(parseIdResult.error, '[UNSUBSCRIBE] Invalid user feed subscription ID'),
      {maybeUserFeedSubscriptionId}
    );
    return;
  }
  const userFeedSubscriptionId = parseIdResult.value;

  // Parse the before and after data.
  if (!beforeData || !afterData) {
    logger.error(new Error('[UNSUBSCRIBE] Missing before or after data'), {
      userFeedSubscriptionId,
    });
    return;
  }

  const beforeResult = parseUserFeedSubscription(beforeData);
  const afterResult = parseUserFeedSubscription(afterData);

  if (!beforeResult.success || !afterResult.success) {
    logger.error(new Error('[UNSUBSCRIBE] Failed to parse user feed subscription data'), {
      userFeedSubscriptionId,
      beforeError: beforeResult.success ? undefined : beforeResult.error.message,
      afterError: afterResult.success ? undefined : afterResult.error.message,
    });
    return;
  }

  const before = beforeResult.value;
  const after = afterResult.value;

  // Only proceed if the subscription was marked as inactive.
  const becameInactive = before.isActive && !after.isActive;
  if (!becameInactive) return;

  const logDetails = {
    userFeedSubscriptionId,
    accountId: after.accountId,
    feedSourceId: after.feedSourceId,
    url: after.url,
  } as const;

  logger.log('[UNSUBSCRIBE] Processing unsubscribe for feed subscription', logDetails);

  const unsubscribeResult = await rssFeedService.unsubscribeAccountFromUrl({
    feedSourceId: after.feedSourceId,
    url: after.url,
    accountId: after.accountId,
  });

  if (!unsubscribeResult.success) {
    const betterError = prefixError(
      unsubscribeResult.error,
      '[UNSUBSCRIBE] Error unsubscribing account from Superfeedr feed'
    );
    logger.error(betterError, logDetails);
    return;
  }

  logger.log('[UNSUBSCRIBE] Successfully unsubscribed account from Superfeedr feed', logDetails);
}
