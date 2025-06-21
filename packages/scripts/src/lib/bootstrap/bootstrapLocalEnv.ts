import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {EmailAddress} from '@shared/types/emails.types';
import type {AsyncResult} from '@shared/types/results.types';

import {saveMockFeedData} from '@src/lib/bootstrap/feedSubscriptions';
import {getEmailForScript} from '@src/lib/cli.scripts';
import {env} from '@src/lib/environment.scripts';
import {initServices} from '@src/lib/initServices.scripts';

import {makeIntervalMockFeedData} from '@src/bootstrap/feeds/interval.bootstrap';
import {makeRssJacobWengerMockFeedData} from '@src/bootstrap/feeds/rssJacobWenger.bootstrap';
import {makeYouTubeJacobWengerMockFeedData} from '@src/bootstrap/feeds/youTubeJacobWenger.bootstrap';

async function bootstrapLocalEnv(email: EmailAddress): AsyncResult<void, Error> {
  // Log the Firebase project info for debugging.
  logger.log('[BOOTSTRAP] Firebase project info', {
    GOOGLE_CLOUD_PROJECT: env.googleCloudProject,
    FIREBASE_PROJECT_ID: env.firebaseProjectId,
  });

  // Initialize services.
  const {accountsService, feedItemsService, feedSubscriptionsService} = initServices({
    firecrawlApiKey: env.firecrawlApiKey,
  });

  logger.log(`[BOOTSTRAP] Looking up account ID associated with email ${email}...`);

  const accountResult = await accountsService.fetchAccountByEmail(email);
  if (!accountResult.success) return accountResult;

  const account = accountResult.value;
  if (account === null) {
    return makeErrorResult(new Error(`No account ID found for email ${email}`));
  }
  const accountId = account.accountId;

  logger.log(`[BOOTSTRAP] Found account ID ${accountId}`);

  const rssJacobWengerMockFeedData = makeRssJacobWengerMockFeedData({accountId});
  const saveMockFeedDataResult = await saveMockFeedData({
    feedSubscription: rssJacobWengerMockFeedData.feedSubscription,
    feedItems: rssJacobWengerMockFeedData.feedItems,
    feedItemsService,
    feedSubscriptionsService,
  });
  if (!saveMockFeedDataResult.success) return saveMockFeedDataResult;

  const youTubeJacobWengerMockFeedData = makeYouTubeJacobWengerMockFeedData({accountId});
  const saveYouTubeMockFeedDataResult = await saveMockFeedData({
    feedSubscription: youTubeJacobWengerMockFeedData.feedSubscription,
    feedItems: youTubeJacobWengerMockFeedData.feedItems,
    feedItemsService,
    feedSubscriptionsService,
  });
  if (!saveYouTubeMockFeedDataResult.success) return saveYouTubeMockFeedDataResult;

  const intervalMockFeedData = makeIntervalMockFeedData({accountId});
  const saveIntervalMockFeedDataResult = await saveMockFeedData({
    feedSubscription: intervalMockFeedData.feedSubscription,
    feedItems: intervalMockFeedData.feedItems,
    feedItemsService,
    feedSubscriptionsService,
  });
  if (!saveIntervalMockFeedDataResult.success) return saveIntervalMockFeedDataResult;

  // Log the bootstrap result and exit successfully.
  // TODO: Fix these numbers.
  const feedSubscriptionsCreated = 3;
  const feedItemsCreated = 2;
  logger.log('✅ Bootstrap completed successfully!');
  logger.log(`📊 Summary:`);
  logger.log(`   Email: ${email}`);
  logger.log(`   Account ID: ${accountId}`);
  logger.log(`   Feed subscriptions: ${feedSubscriptionsCreated}`);
  logger.log(`   Feed items: ${feedItemsCreated}`);
  logger.log('');
  logger.log('🎉 Your development environment is now ready!');

  return makeSuccessResult(undefined);
}

// Get the email from the command line or environment variable.
const emailResult = getEmailForScript();
if (!emailResult.success) {
  logger.error(emailResult.error);
  process.exit(1);
}
const email = emailResult.value;

// Bootstrap local environment.
const bootstrapResult = await bootstrapLocalEnv(email);
if (!bootstrapResult.success) {
  const betterError = prefixErrorResult(bootstrapResult, 'Bootstrap failed');
  logger.error(betterError.error);
  process.exit(1);
}

process.exit(0);
