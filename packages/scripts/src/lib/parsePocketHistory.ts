import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

import FirecrawlApp from '@mendable/firecrawl-js';
import dotenv from 'dotenv';

import {logger} from '@shared/services/logger.shared';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
} from '@shared/lib/constants.shared';
import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';
import {pluralizeWithCount} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';

import {FEED_ITEM_POCKET_EXPORT_SOURCE} from '@shared/types/feedItems.types';
import type {PocketImportItem} from '@shared/types/pocket.types';

import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {ServerFirecrawlService} from '@sharedServer/services/firecrawl.server';
import {
  makeFirestoreDataConverter,
  ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';

import {ServerPocketService} from '@sharedServer/lib/pocket.server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from packages/scripts/.env file
const envResult = dotenv.config({path: path.resolve(__dirname, '../../.env')});
if (envResult.error) {
  logger.log(`Error loading .env file: ${envResult.error.message}`);
  process.exit(1);
}

// Load Firecrawl API key from environment variable.
const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
if (!firecrawlApiKey) {
  logger.error(new Error('FIRECRAWL_API_KEY environment variable is not defined'));
  process.exit(1);
}

const accountIdResult = parseAccountId(process.env.FIREBASE_USER_ID || '');
if (!accountIdResult.success) {
  logger.error(prefixError(accountIdResult.error, 'Invalid FIREBASE_USER_ID environment variable'));
  process.exit(1);
}
const accountId = accountIdResult.value;

// Download file from https://getpocket.com/export.
const POCKET_EXPORT_FILE_PATH = path.resolve(__dirname, '../resources/pocketExport.html');

const OUTPUT_FILE_PATH = path.resolve(__dirname, '../resources/pocketHistory.tsv');

async function main(): Promise<void> {
  const feedItemFirestoreConverter = makeFirestoreDataConverter(toStorageFeedItem, parseFeedItem);

  const feedItemsCollectionService = new ServerFirestoreCollectionService({
    collectionPath: FEED_ITEMS_DB_COLLECTION,
    converter: feedItemFirestoreConverter,
    parseId: parseFeedItemId,
  });

  const firecrawlApp = new FirecrawlApp({apiKey: firecrawlApiKey});
  const firecrawlService = new ServerFirecrawlService(firecrawlApp);

  const feedItemsService = new ServerFeedItemsService({
    feedItemsCollectionService,
    storageCollectionPath: FEED_ITEMS_STORAGE_COLLECTION,
    firecrawlService,
  });

  const pocketItemsResult = await ServerPocketService.parseExportFromFile(POCKET_EXPORT_FILE_PATH);

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

    logger.log(
      `${pocketItem.title} ${pocketItem.url} ${new Date(pocketItem.timeAddedMs).toISOString()}`
    );

    const createFeedItemResult = await feedItemsService.createFeedItem({
      accountId,
      url: pocketItem.url,
      feedItemSource: FEED_ITEM_POCKET_EXPORT_SOURCE,
      title: pocketItem.title,
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

  const writeTsvResult = await asyncTry(async () => {
    await fs.writeFile(OUTPUT_FILE_PATH, tsvFields, 'utf-8');
  });

  if (!writeTsvResult.success) {
    logger.error(prefixError(writeTsvResult.error, 'Error writing Pocket export to TSV file'));
    process.exit(1);
  }

  logger.log(`Exported Pocket history to ${OUTPUT_FILE_PATH}`);
  process.exit(0);
}

/** Escapes a field so it can be safely written to a TSV file. */
function escapeFieldForTsv(field: string): string {
  return field.replace(/\t/g, ' ').replace(/\n/g, ' ');
}

void main();
