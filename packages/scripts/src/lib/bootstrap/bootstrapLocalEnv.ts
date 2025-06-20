import arg from 'arg';

import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {EmailAddress} from '@shared/types/emails.types';
import type {AsyncResult} from '@shared/types/results.types';

import {createSampleFeedItems} from '@src/lib/bootstrap/feedItems';
import {createSampleUserFeedSubscriptions} from '@src/lib/bootstrap/userFeedSubscriptions';
import {env} from '@src/lib/environment.scripts';
import {firebaseService} from '@src/lib/firebase.scripts';
import {initServices} from '@src/lib/initServices.scripts';

interface BootstrapResult {
  readonly accountId: AccountId;
  readonly firebaseUid: string;
  readonly userFeedSubscriptionsCreated: number;
  readonly feedItemsCreated: number;
}

async function bootstrapLocalEnv(args: {
  readonly email: string;
}): AsyncResult<BootstrapResult, Error> {
  const {email} = args;

  // Log the Firebase project info for debugging.
  logger.log('[BOOTSTRAP] Firebase project info', {
    GOOGLE_CLOUD_PROJECT: env.googleCloudProject,
    FIREBASE_PROJECT_ID: env.firebaseProjectId,
  });

  // Parse email.
  const emailResult = parseEmailAddress(email);
  if (!emailResult.success) return emailResult;
  const parsedEmail = emailResult.value;

  // Look up the Firebase user by email
  logger.log('[BOOTSTRAP] Looking up Firebase user...', {email: parsedEmail});
  const userResult = await asyncTry(async () => firebaseService.auth.getUserByEmail(parsedEmail));

  if (!userResult.success) {
    const message =
      `No Firebase user exists with email ${parsedEmail}. Make sure the user exists and you ` +
      `have authenticated to Firebase.`;
    return prefixErrorResult(userResult, message);
  }

  const firebaseUid = userResult.value.uid;

  logger.log('[BOOTSTRAP] Found Firebase user', {firebaseUid});

  // Parse account ID from the Firebase UID.
  const accountIdResult = parseAccountId(firebaseUid);
  if (!accountIdResult.success) return accountIdResult;
  const accountId = accountIdResult.value;

  // Initialize services.
  const {feedItemsService} = initServices({firecrawlApiKey: env.firecrawlApiKey});

  // Create user feed subscriptions.
  logger.log('[BOOTSTRAP] Creating user feed subscriptions...', {accountId});
  const subscriptionsResult = await createSampleUserFeedSubscriptions({
    accountId,
    firebaseService,
  });
  if (!subscriptionsResult.success) {
    return prefixErrorResult(subscriptionsResult, 'Failed to create user feed subscriptions');
  }
  logger.log('[BOOTSTRAP] Created user feed subscriptions', {accountId});

  const {rssSubscriptions, intervalSubscriptions, youtubeSubscriptions} = subscriptionsResult.value;

  // Create feed items.
  logger.log('[BOOTSTRAP] Creating feed items...', {accountId});
  const feedItemsResult = await createSampleFeedItems({
    accountId,
    rssSubscriptions,
    intervalSubscriptions,
    youtubeSubscriptions,
    feedItemsService,
  });
  if (!feedItemsResult.success) {
    return prefixErrorResult(feedItemsResult, 'Failed to create feed items');
  }
  logger.log('[BOOTSTRAP] Created feed items', {accountId});

  const result: BootstrapResult = {
    accountId,
    firebaseUid,
    userFeedSubscriptionsCreated: subscriptionsResult.value.count,
    feedItemsCreated: feedItemsResult.value.count,
  };

  return makeSuccessResult(result);
}

function getEmail(): EmailAddress {
  const flags = arg({
    '--email': String,
    '-e': '--email',
  });

  let email: string | undefined;
  const emailFromFlags: string | undefined = flags['--email'];

  // Use the email from the command line if provided. Otherwise, use the email from the environment.
  if (emailFromFlags) {
    email = emailFromFlags;
  } else {
    const emailFromEnv = env.localEmailAddress;
    if (emailFromEnv) {
      const message = `No email provided, using LOCAL_EMAIL_ADDRESS environment variable: ${emailFromEnv}`;
      logger.log(message);
      email = emailFromEnv;
    }
  }

  // If no email is provided, log an error and exit.
  if (!email) {
    const message =
      `Usage: npx tsx ${process.argv[1]} --email <email>\n` +
      `Or set LOCAL_EMAIL_ADDRESS environment variable`;
    logger.error(new Error(message));
    process.exit(1);
  }

  const parseEmailResult = parseEmailAddress(email);
  if (!parseEmailResult.success) {
    const message = `Provided email address is invalid`;
    logger.error(new Error(message), {email});
    process.exit(1);
  }

  return parseEmailResult.value;
}

// Bootstrap local environment.
const email = getEmail();
const bootstrapResult = await bootstrapLocalEnv({email});

// If the bootstrap fails, log an error and exit.
if (!bootstrapResult.success) {
  const betterError = prefixErrorResult(bootstrapResult, 'Bootstrap failed');
  logger.error(betterError.error);
  process.exit(1);
}

// Log the bootstrap result and exit successfully.
const {accountId, firebaseUid, userFeedSubscriptionsCreated, feedItemsCreated} =
  bootstrapResult.value;
logger.log('✅ Bootstrap completed successfully!');
logger.log(`📊 Summary:`);
logger.log(`   Email: ${email}`);
logger.log(`   Firebase UID: ${firebaseUid}`);
logger.log(`   Account ID: ${accountId}`);
logger.log(`   User Feed Subscriptions: ${userFeedSubscriptionsCreated}`);
logger.log(`   Feed Items: ${feedItemsCreated}`);
logger.log('');
logger.log('🎉 Your development environment is now ready!');

process.exit(0);
