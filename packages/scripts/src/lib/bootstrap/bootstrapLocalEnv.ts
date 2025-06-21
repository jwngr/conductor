import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {EmailAddress} from '@shared/types/emails.types';
import type {AccountId} from '@shared/types/ids.types';
import type {AsyncResult} from '@shared/types/results.types';

import {saveMockFeedData} from '@src/lib/bootstrap/feedSubscriptions';
import {getEmailForScript} from '@src/lib/cli.scripts';
import {env} from '@src/lib/environment.scripts';
import {initServices} from '@src/lib/initServices.scripts';

import {makeRssJacobWengerMockFeedData} from '@src/bootstrap/feeds/rssJacobWenger.bootstrap';
import {makeYouTubeJacobWengerMockFeedData} from '@src/bootstrap/feeds/youTubeJacobWenger.bootstrap';

interface BootstrapResult {
  readonly accountId: AccountId;
  readonly feedSubscriptionsCreated: number;
  readonly feedItemsCreated: number;
}

async function bootstrapLocalEnv(args: {
  readonly email: EmailAddress;
}): AsyncResult<BootstrapResult, Error> {
  const {email} = args;

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

  return makeSuccessResult({
    accountId,
    feedSubscriptionsCreated: 2,
    feedItemsCreated: 2,
  });
}

// Get the email from the command line or environment variable.
const emailResult = getEmailForScript();
if (!emailResult.success) {
  const betterError = prefixErrorResult(emailResult, 'Failed to get email');
  logger.error(betterError.error);
  process.exit(1);
}
const email = emailResult.value;

// Bootstrap local environment.
const bootstrapResult = await bootstrapLocalEnv({email});

// If the bootstrap fails, log an error and exit.
if (!bootstrapResult.success) {
  const betterError = prefixErrorResult(bootstrapResult, 'Bootstrap failed');
  logger.error(betterError.error);
  process.exit(1);
}

// Log the bootstrap result and exit successfully.
const {accountId, feedSubscriptionsCreated, feedItemsCreated} = bootstrapResult.value;
logger.log('✅ Bootstrap completed successfully!');
logger.log(`📊 Summary:`);
logger.log(`   Email: ${email}`);
logger.log(`   Account ID: ${accountId}`);
logger.log(`   Feed subscriptions: ${feedSubscriptionsCreated}`);
logger.log(`   Feed items: ${feedItemsCreated}`);
logger.log('');
logger.log('🎉 Your development environment is now ready!');

process.exit(0);
