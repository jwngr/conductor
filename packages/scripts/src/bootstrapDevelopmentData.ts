import arg from 'arg';

import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {EmailAddress} from '@shared/types/emails.types';
import type {AsyncResult} from '@shared/types/results.types';

import {bootstrapAccountData} from '@src/lib/bootstrapData/account';
import {createSampleExperiments} from '@src/lib/bootstrapData/experiments';
import {createSampleFeedItems} from '@src/lib/bootstrapData/feedItems';
import {createSampleUserFeedSubscriptions} from '@src/lib/bootstrapData/userFeedSubscriptions';
import {env} from '@src/lib/environment.scripts';
import {firebaseService} from '@src/lib/firebase.scripts';
import {initServices} from '@src/lib/initServices.scripts';

interface BootstrapResult {
  readonly accountId: AccountId;
  readonly firebaseUid: string;
  readonly userFeedSubscriptionsCreated: number;
  readonly feedItemsCreated: number;
  readonly experimentsCreated: number;
}

async function bootstrapDevelopmentData(args: {
  readonly email: string;
}): AsyncResult<BootstrapResult, Error> {
  const {email} = args;

  // Log the Firebase project info for debugging.
  logger.log('[BOOTSTRAP] Firebase project info', {
    GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST,
  });

  // Parse email.
  const emailResult = parseEmailAddress(email);
  if (!emailResult.success) return emailResult;
  const parsedEmail = emailResult.value;

  // Look up the Firebase user by email
  logger.log('[BOOTSTRAP] Looking up Firebase user...', {email: parsedEmail});
  const userResult = await asyncTry(async () => {
    const userRecord = await firebaseService.auth.getUserByEmail(parsedEmail);
    return userRecord;
  });

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

  // Initialize services (without Firecrawl since we don't need it for bootstrap).
  const {feedItemsService} = initServices({firecrawlApiKey: 'dummy-key'}); // We don't actually use Firecrawl for bootstrap

  // Bootstrap account data.
  logger.log('[BOOTSTRAP] Bootstrapping account data...', {accountId, email: parsedEmail});
  const accountDataResult = await bootstrapAccountData({
    accountId,
    email: parsedEmail,
    firebaseService,
  });
  if (!accountDataResult.success) {
    return prefixErrorResult(accountDataResult, 'Failed to bootstrap account data');
  }
  logger.log('[BOOTSTRAP] Bootstrapped account data', {accountId});

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

  // Create feed items.
  logger.log('[BOOTSTRAP] Creating feed items...', {accountId});
  const feedItemsResult = await createSampleFeedItems({
    accountId,
    feedItemsService,
  });
  if (!feedItemsResult.success) {
    return prefixErrorResult(feedItemsResult, 'Failed to create feed items');
  }
  logger.log('[BOOTSTRAP] Created feed items', {accountId});

  // Create experiments.
  logger.log('[BOOTSTRAP] Creating experiments...', {accountId});
  const experimentsResult = await createSampleExperiments({
    accountId,
    email: parsedEmail,
    firebaseService,
  });
  if (!experimentsResult.success) {
    return prefixErrorResult(experimentsResult, 'Failed to create experiments');
  }
  logger.log('[BOOTSTRAP] Created experiments', {accountId});

  const result: BootstrapResult = {
    accountId,
    firebaseUid,
    userFeedSubscriptionsCreated: subscriptionsResult.value.count,
    feedItemsCreated: feedItemsResult.value.count,
    experimentsCreated: experimentsResult.value.count,
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
    const envEmail = env.internalAccountEmailAddress;
    if (envEmail) {
      logger.log('[BOOTSTRAP] Using default email from environment', {email: envEmail});
      email = envEmail;
    }
  }

  // If no email is provided, log an error and exit.
  if (!email) {
    const message =
      `Usage: npx tsx ${process.argv[1]} --email <email>\nOr set INTERNAL_ACCOUNT_EMAIL_ADDRESS in ` +
      `your environment.`;
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

// Bootstrap development data.
const email = getEmail();
const bootstrapResult = await bootstrapDevelopmentData({email});

// If the bootstrap fails, log an error and exit.
if (!bootstrapResult.success) {
  const betterError = prefixErrorResult(bootstrapResult, 'Bootstrap failed');
  logger.error(betterError.error);
  process.exit(1);
}

// Log the bootstrap result and exit successfully.
const {accountId, firebaseUid, userFeedSubscriptionsCreated, feedItemsCreated, experimentsCreated} =
  bootstrapResult.value;
logger.log('✅ Bootstrap completed successfully!');
logger.log(`📊 Summary:`);
logger.log(`   Email: ${email}`);
logger.log(`   Firebase UID: ${firebaseUid}`);
logger.log(`   Account ID: ${accountId}`);
logger.log(`   User Feed Subscriptions: ${userFeedSubscriptionsCreated}`);
logger.log(`   Feed Items: ${feedItemsCreated}`);
logger.log(`   Experiments: ${experimentsCreated}`);
logger.log('');
logger.log('🎉 Your development environment is now ready!');

process.exit(0);
