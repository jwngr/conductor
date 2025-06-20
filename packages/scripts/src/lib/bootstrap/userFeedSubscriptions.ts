import {logger} from '@shared/services/logger.shared';

import {arrayMap} from '@shared/lib/arrayUtils.shared';
import {PERSONAL_YOUTUBE_CHANNEL_ID} from '@shared/lib/constants.shared';
import {asyncTryAll, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {
  makeIntervalUserFeedSubscription,
  makeRssUserFeedSubscription,
  makeYouTubeChannelUserFeedSubscription,
} from '@shared/lib/userFeedSubscriptions.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {
  IntervalUserFeedSubscription,
  RssUserFeedSubscription,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';

import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';
import {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';

import {getMockUserFeedSubscriptions} from '@src/bootstrap/userFeedSubscriptions.bootstrap';

interface CreateSampleUserFeedSubscriptionsArgs {
  readonly accountId: AccountId;
  readonly firebaseService: ServerFirebaseService;
}

interface CreateSampleUserFeedSubscriptionsResult {
  readonly count: number;
  readonly rssSubscriptions: readonly RssUserFeedSubscription[];
  readonly youtubeSubscriptions: readonly YouTubeChannelUserFeedSubscription[];
  readonly intervalSubscriptions: readonly IntervalUserFeedSubscription[];
}

export async function createSampleUserFeedSubscriptions(
  args: CreateSampleUserFeedSubscriptionsArgs
): AsyncResult<CreateSampleUserFeedSubscriptionsResult, Error> {
  const {accountId, firebaseService} = args;

  const userFeedSubscriptionsService = new ServerUserFeedSubscriptionsService({firebaseService});

  const mockUserFeedSubscriptions = getMockUserFeedSubscriptions({accountId});
  const saveResults2 = arrayMap(mockUserFeedSubscriptions, async (subscription) => {
    const saveResult = await userFeedSubscriptionsService.createSubscription(subscription);
    if (!saveResult.success) {
      const betterError = prefixErrorResult(saveResult, 'Failed to save user feed subscription');
      logger.error(betterError.error, {
        subscriptionId: subscription.userFeedSubscriptionId,
        feedSourceType: subscription.feedSourceType,
      });
    }
    return saveResult;
  });

  const batchSaveResult = await asyncTryAll(saveResults2);
  if (!batchSaveResult.success) return batchSaveResult;

  // Create sample RSS subscriptions.
  const rssSubscriptions = [
    makeRssUserFeedSubscription({
      accountId,
      url: 'https://feeds.feedburner.com/TechCrunch',
      title: 'TechCrunch',
    }),
    makeRssUserFeedSubscription({
      accountId,
      url: 'https://rss.cnn.com/rss/edition.rss',
      title: 'CNN',
    }),
    makeRssUserFeedSubscription({
      accountId,
      url: 'https://feeds.bbci.co.uk/news/rss.xml',
      title: 'BBC News',
    }),
  ];

  // Create sample YouTube channel subscription.
  const youtubeSubscription = makeYouTubeChannelUserFeedSubscription({
    accountId,
    channelId: PERSONAL_YOUTUBE_CHANNEL_ID,
  });

  // Create sample interval subscription.
  const intervalSubscription = makeIntervalUserFeedSubscription({
    accountId,
    intervalSeconds: 300, // 5 minutes
  });

  const allSubscriptions = [...rssSubscriptions, youtubeSubscription, intervalSubscription];

  // Save all subscriptions using the service's createSubscription method.
  const savePromises = allSubscriptions.map(async (subscription) => {
    const saveResult = await userFeedSubscriptionsService.createSubscription(subscription);
    if (!saveResult.success) {
      logger.error(saveResult.error, {
        subscriptionId: subscription.userFeedSubscriptionId,
        feedSourceType: subscription.feedSourceType,
      });
    }
    return saveResult;
  });

  const saveResults = await Promise.all(savePromises);
  const failedResults = saveResults.filter((result) => !result.success);

  if (failedResults.length > 0) {
    const firstError = failedResults[0];
    return prefixErrorResult(firstError, 'Failed to save some user feed subscriptions');
  }

  logger.log('[BOOTSTRAP] Successfully created user feed subscriptions', {
    accountId,
    count: allSubscriptions.length,
  });

  return makeSuccessResult({
    count: allSubscriptions.length,
    rssSubscriptions: rssSubscriptions,
    youtubeSubscriptions: [youtubeSubscription],
    intervalSubscriptions: [intervalSubscription],
  });
}
