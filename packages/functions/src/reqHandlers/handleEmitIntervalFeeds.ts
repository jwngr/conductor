import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeIntervalFeedSource} from '@shared/lib/feedSources.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {pluralizeWithCount} from '@shared/lib/utils.shared';

import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import type {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';

export async function handleEmitIntervalFeeds(args: {
  feedItemsService: ServerFeedItemsService;
  userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
}): AsyncResult<void> {
  const {feedItemsService, userFeedSubscriptionsService} = args;

  const innerLog = (message: string, details: Record<string, unknown> = {}): void => {
    logger.log(`[INTERVAL FEEDS] ${message}`, details);
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
  const roundedMinutesSinceMidnight = Math.round(minutesSinceMidnight / 5) * 5;

  // Loop through each interval subscription and emit a new feed item if the time has come.
  // TODO: Do these in parallel batches, not sequentially.
  for (const currentIntervalSub of intervalSubscriptions) {
    const {intervalSeconds, accountId, userFeedSubscriptionId} = currentIntervalSub;

    const intervalMinutes = intervalSeconds / 60;
    const shouldEmit = roundedMinutesSinceMidnight % intervalMinutes === 0;

    if (!shouldEmit) {
      innerLog('Skipping emission of interval feed item', {accountId, userFeedSubscriptionId});
      continue;
    }

    innerLog('Creating interval feed item', {accountId, userFeedSubscriptionId, intervalSeconds});

    const feedItemResult = await feedItemsService.createFeedItem({
      accountId,
      feedSource: makeIntervalFeedSource({
        userFeedSubscription: currentIntervalSub,
      }),
      // TODO: Consider making `url` optional.
      url: 'https://conductor.now/',
      title: `Interval feed item for ${now.toISOString()}`,
      description: '',
    });

    if (!feedItemResult.success) {
      // TODO: Don't let one failure stop other interval feed items from being emitted.
      return prefixErrorResult(feedItemResult, 'Error creating interval feed item');
    }

    const feedItemId = feedItemResult.value;
    innerLog('Interval feed item emitted', {accountId, userFeedSubscriptionId, feedItemId});
  }

  return makeSuccessResult(undefined);
}
