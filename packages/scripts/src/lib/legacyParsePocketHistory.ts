import path from 'path';
import {fileURLToPath} from 'url';

import dotenv from 'dotenv';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {POCKET_EXPORT_FEED_SOURCE} from '@shared/lib/feedSources.shared';
import {pluralizeWithCount} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {PocketImportItem} from '@shared/types/pocket.types';

import {ServerPocketService} from '@sharedServer/lib/pocket.server';

import {env} from '@src/lib/environment.scripts';
import {initServices} from '@src/lib/initServices.scripts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from packages/scripts/.env file
const envResult = dotenv.config({path: path.resolve(__dirname, '../../.env')});
if (envResult.error) {
  logger.log(`Error loading .env file: ${envResult.error.message}`);
  process.exit(1);
}

const accountIdResult = parseAccountId(env.firebaseUserId);
if (!accountIdResult.success) {
  logger.error(prefixError(accountIdResult.error, 'Invalid FIREBASE_USER_ID environment variable'));
  process.exit(1);
}
const accountId = accountIdResult.value;

const args = process.argv.slice(2);
if (args.length === 0) {
  logger.error(new Error('No Pocket export file path provided'));
  logger.log(`Usage: node ${process.argv[1]} <path/to/pocket/export.json>`);
  process.exit(1);
}

const POCKET_EXPORT_FILE_PATH = path.resolve(args[0]);

/**
 * Throws if the Firecrawl API key environment variable is not defined.
 */
function validateFirecrawlApiKey(): string {
  const firecrawlApiKey = env.firecrawlApiKey;

  if (!firecrawlApiKey) {
    logger.error(new Error('FIRECRAWL_API_KEY environment variable is not defined'));
    process.exit(1);
  }

  return firecrawlApiKey;
}

async function main(): Promise<void> {
  const firecrawlApiKey = validateFirecrawlApiKey();
  const {feedItemsService} = initServices({firecrawlApiKey});

  const pocketItemsResult = await ServerPocketService.parseHtmlExportFile(POCKET_EXPORT_FILE_PATH);
  if (!pocketItemsResult.success) {
    logger.error(prefixError(pocketItemsResult.error, 'Error parsing Pocket export file'));
    process.exit(1);
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

    const createFeedItemResult = await feedItemsService.createFeedItemFromUrl({
      feedSource: POCKET_EXPORT_FEED_SOURCE,
      accountId,
      url: pocketItem.url,
      title: pocketItem.title,
      // These values are not provided in the Pocket export.
      description: null,
      outgoingLinks: [],
      summary: null,
    });

    if (!createFeedItemResult.success) {
      // Treat individual errors as non-fatal.
      logger.error(
        prefixError(createFeedItemResult.error, `Error creating feed item for ${pocketItem.url}`)
      );
      continue;
    }
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

  // Output to stdout instead of writing to a file
  process.stdout.write(tsvFields);
}

/** Escapes a field so it can be safely written to a TSV file. */
function escapeFieldForTsv(field: string): string {
  return field.replace(/\t/g, ' ').replace(/\n/g, ' ');
}

void main();
