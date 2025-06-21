import path from 'path';

import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixError, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {POCKET_EXPORT_FEED} from '@shared/lib/feeds.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {pluralizeWithCount} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {EmailAddress} from '@shared/types/emails.types';
import type {AccountId} from '@shared/types/ids.types';
import type {PocketImportItem} from '@shared/types/pocket.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';

import {ServerPocketService} from '@sharedServer/lib/pocket.server';

import {env} from '@src/lib/environment.scripts';
import {initServices} from '@src/lib/initServices.scripts';

async function getAccountId(args: {
  readonly email: EmailAddress;
  readonly firebaseService: ServerFirebaseService;
}): AsyncResult<AccountId, Error> {
  const {email, firebaseService} = args;

  // Log the Firebase project info for debugging.
  logger.log('[BOOTSTRAP] Firebase project info', {
    GOOGLE_CLOUD_PROJECT: env.googleCloudProject,
    FIREBASE_PROJECT_ID: env.firebaseProjectId,
  });

  // Look up the Firebase user by email
  const userResult = await asyncTry(async () => firebaseService.auth.getUserByEmail(email));

  if (!userResult.success) {
    const message =
      `No Firebase user exists with email ${email}. Make sure the user exists and you ` +
      `have authenticated to Firebase.`;
    return prefixErrorResult(userResult, message);
  }

  const firebaseUid = userResult.value.uid;

  // Parse account ID from the Firebase UID.
  const accountIdResult = parseAccountId(firebaseUid);
  if (!accountIdResult.success) return accountIdResult;

  return makeSuccessResult(accountIdResult.value);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  logger.error(new Error('No Pocket export file path provided'));
  logger.log(`Usage: node ${process.argv[1]} <path/to/pocket/export.json>`);
  process.exit(1);
}

const POCKET_EXPORT_FILE_PATH = path.resolve(args[0]);

async function main(): AsyncResult<string, Error> {
  const {feedItemsService, firebaseService} = initServices({firecrawlApiKey: env.firecrawlApiKey});

  const accountIdResult = await getAccountId({
    email: env.localEmailAddress,
    firebaseService,
  });
  if (!accountIdResult.success) {
    const betterErrorResult = prefixErrorResult(accountIdResult, 'Error getting account ID');
    logger.error(betterErrorResult.error);
    return betterErrorResult;
  }
  const accountId = accountIdResult.value;

  const pocketItemsResult = await ServerPocketService.parseHtmlExportFile(POCKET_EXPORT_FILE_PATH);
  if (!pocketItemsResult.success) {
    const message = 'Error parsing Pocket export file';
    const betterErrorResult = prefixErrorResult(pocketItemsResult, message);
    logger.error(betterErrorResult.error);
    return betterErrorResult;
  }

  const itemsWithCount = pluralizeWithCount(pocketItemsResult.value.length, 'item', 'items');
  logger.log(`Successfully parsed Pocket export with ${itemsWithCount}.`);

  const pocketItems = pocketItemsResult.value;

  const janFirst2024 = new Date('2024-01-01');
  const janThird2024 = new Date('2024-01-10');
  for (const pocketItem of pocketItems) {
    // Exclude items outside desired date range.
    if (
      pocketItem.timeAddedMs < janFirst2024.getTime() ||
      pocketItem.timeAddedMs > janThird2024.getTime()
    ) {
      continue;
    }

    const feedItem = feedItemsService.makeFeedItemFromUrl({
      origin: POCKET_EXPORT_FEED,
      accountId,
      url: pocketItem.url,
      title: pocketItem.title,
      // These values are not provided in the Pocket export.
      description: null,
      summary: null,
    });

    const addFeedItemResult = await feedItemsService.addFeedItem(feedItem);
    if (!addFeedItemResult.success) {
      logger.error(prefixError(addFeedItemResult.error, 'Error creating feed item'));
      continue;
    }

    logger.log('Successfully created feed item', {feedItemId: feedItem.feedItemId});
  }

  const tsvFields = pocketItems
    .map((item: PocketImportItem) =>
      [
        escapeFieldForTsv(item.url),
        escapeFieldForTsv(item.title),
        item.timeAddedMs.toString(),
      ].join('\t')
    )
    .join('\n');

  return makeSuccessResult(tsvFields);
}

/** Escapes a field so it can be safely written to a TSV file. */
function escapeFieldForTsv(field: string): string {
  return field.replace(/\t/g, ' ').replace(/\n/g, ' ');
}

const result = await main();
if (!result.success) {
  logger.error(result.error);
  process.exit(1);
}

// Output to stdout instead of writing to a file
process.stdout.write(result.value);

logger.log('\n✅ Successfully output Pocket export to stdout');
process.exit(0);
