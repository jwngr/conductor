import {logger} from '@shared/services/logger.shared';

import {PERSONAL_YOUTUBE_CHANNEL_ID} from '@shared/lib/constants.shared';
import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {
  makeIntervalFeedSubscription,
  makeRssFeedSubscription,
  makeYouTubeChannelFeedSubscription,
} from '@shared/lib/feedSubscriptions.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {
  IntervalFeedSubscription,
  RssFeedSubscription,
  YouTubeChannelFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import type {AccountId} from '@shared/types/ids.types';
import type {AsyncResult} from '@shared/types/results.types';

import {ServerFeedSubscriptionsService} from '@sharedServer/services/feedSubscriptions.server';
import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';

interface CreateSampleFeedSubscriptionsResult {
  readonly count: number;
  readonly rssSubscriptions: readonly RssFeedSubscription[];
  readonly youtubeSubscriptions: readonly YouTubeChannelFeedSubscription[];
  readonly intervalSubscriptions: readonly IntervalFeedSubscription[];
}

export async function createSampleFeedSubscriptions(args: {
  readonly accountId: AccountId;
  readonly firebaseService: ServerFirebaseService;
}): AsyncResult<CreateSampleFeedSubscriptionsResult, Error> {
  const {accountId, firebaseService} = args;

  const feedSubscriptionsService = new ServerFeedSubscriptionsService({firebaseService});

  // Create sample RSS subscriptions.
  const rssSubscriptions = [
    makeRssFeedSubscription({
      accountId,
      url: 'https://feeds.feedburner.com/TechCrunch',
      title: 'TechCrunch',
    }),
    makeRssFeedSubscription({
      accountId,
      url: 'https://rss.cnn.com/rss/edition.rss',
      title: 'CNN',
    }),
    makeRssFeedSubscription({
      accountId,
      url: 'https://feeds.bbci.co.uk/news/rss.xml',
      title: 'BBC News',
    }),
  ];

  // Create sample YouTube channel subscription.
  const youtubeSubscription = makeYouTubeChannelFeedSubscription({
    accountId,
    channelId: PERSONAL_YOUTUBE_CHANNEL_ID,
  });

  // Create sample interval subscription.
  const intervalSubscription = makeIntervalFeedSubscription({
    accountId,
    intervalSeconds: 300, // 5 minutes
  });

  const allSubscriptions = [...rssSubscriptions, youtubeSubscription, intervalSubscription];

  // Save all subscriptions using the service's createSubscription method.
  const savePromises = allSubscriptions.map(async (subscription) => {
    const saveResult = await feedSubscriptionsService.createSubscription(subscription);
    if (!saveResult.success) {
      logger.error(saveResult.error, {
        subscriptionId: subscription.feedSubscriptionId,
        feedType: subscription.feedType,
      });
    }
    return saveResult;
  });

  const saveResults = await Promise.all(savePromises);
  const failedResults = saveResults.filter((result) => !result.success);

  if (failedResults.length > 0) {
    const firstError = failedResults[0];
    return prefixErrorResult(firstError, 'Failed to save some feed subscriptions');
  }

  logger.log('[BOOTSTRAP] Successfully created feed subscriptions', {
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
