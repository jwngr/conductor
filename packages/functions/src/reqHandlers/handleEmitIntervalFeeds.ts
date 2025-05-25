import {logger} from '@shared/services/logger.shared';

import {prefixError, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {pluralizeWithCount} from '@shared/lib/utils.shared';

import type {IntervalFeedItem} from '@shared/types/feedItems.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import type {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';

export const INTERVAL_FEED_EMISSION_INTERVAL_MINUTES = 5;

export async function handleEmitIntervalFeeds(args: {
  feedItemsService: ServerFeedItemsService;
  userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
}): AsyncResult<{
  readonly totalCount: number;
  readonly successCount: number;
  readonly failureCount: number;
}> {
  const {feedItemsService, userFeedSubscriptionsService} = args;

  const innerLog = (message: string, details: Record<string, unknown> = {}): void => {
    logger.log(`[INTERVAL FEEDS] ${message}`, details);
  };

  const innerLogError = (error: Error, prefix: string): void => {
    logger.error(prefixError(error, `[INTERVAL FEEDS] ${prefix}`));
  };

  // Fetch all interval feed subscriptions.
  const intervalSubsResult = await userFeedSubscriptionsService.fetchActiveIntervalSubscriptions();
  if (!intervalSubsResult.success) {
    return prefixErrorResult(intervalSubsResult, 'Error fetching interval feed subscriptions');
  }

  const intervalSubscriptions = intervalSubsResult.value;

  innerLog(
    `Fetched ${pluralizeWithCount(intervalSubscriptions.length, 'interval feed subscription')}`,
    {intervalSubscriptions}
  );

  // TODO: Use a time relative to the user's timezone.
  const now = new Date();
  const minutesSinceMidnight = now.getUTCHours() * 60 + now.getUTCMinutes();
  const roundedMinutesSinceMidnight =
    Math.floor(minutesSinceMidnight / INTERVAL_FEED_EMISSION_INTERVAL_MINUTES) *
    INTERVAL_FEED_EMISSION_INTERVAL_MINUTES;

  // Loop through each interval subscription and emit a new feed item if the time has come.
  const feedItemEmitAsyncResults: Array<AsyncResult<IntervalFeedItem>> = [];
  for (const currentIntervalSub of intervalSubscriptions) {
    const {intervalSeconds, accountId, userFeedSubscriptionId} = currentIntervalSub;

    // Emit if the emit time is within the last time the interval was checked. Ensure we do not
    // emit more than once per interval.
    const intervalMinutes = intervalSeconds / 60;
    const shouldEmit = roundedMinutesSinceMidnight % intervalMinutes === 0;

    if (!shouldEmit) {
      innerLog('Skipping emission of interval feed item', {accountId, userFeedSubscriptionId});
      continue;
    }

    innerLog('Creating interval feed item', {accountId, userFeedSubscriptionId, intervalSeconds});

    feedItemEmitAsyncResults.push(
      feedItemsService.createIntervalFeedItem({
        accountId,
        userFeedSubscription: currentIntervalSub,
      })
    );
  }

  const feedItemEmitResults = await Promise.all(feedItemEmitAsyncResults);

  // Consider it a failure if any of the interval feed items fail to emit. Log all errors but only
  // return the first error.
  let failureCount = 0;
  for (const feedItemEmitResult of feedItemEmitResults) {
    if (!feedItemEmitResult.success) {
      innerLogError(feedItemEmitResult.error, 'Error creating interval feed item');
      failureCount++;
    }
  }

  return makeSuccessResult({
    totalCount: feedItemEmitResults.length,
    successCount: feedItemEmitResults.length - failureCount,
    failureCount,
  });
}
