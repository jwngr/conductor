import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

import {logger} from '@shared/services/logger.shared';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
} from '@shared/lib/constants.shared';
import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';
import {pluralizeWithCount} from '@shared/lib/utils.shared';

import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';

import type {AccountId} from '@shared/types/accounts.types';
import {FEED_ITEM_POCKET_EXPORT_SOURCE} from '@shared/types/feedItems.types';
import type {PocketImportItem} from '@shared/types/pocket.types';

import {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {
  makeFirestoreDataConverter,
  ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';

import {ServerPocketService} from '@sharedServer/lib/pocket.server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  const feedItemsService = new ServerFeedItemsService({
    feedItemsCollectionService,
    storageCollectionPath: FEED_ITEMS_STORAGE_COLLECTION,
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

    console.log(pocketItem.title, pocketItem.url, new Date(pocketItem.timeAddedMs).toISOString());

    const createFeedItemResult = await feedItemsService.createFeedItem({
      // TODO: Stop using hard-coded account ID.
      accountId: 'iwyEQZp8yyf7bmnBLSUateGfXU32' as AccountId,
      url: pocketItem.url,
      feedItemSource: FEED_ITEM_POCKET_EXPORT_SOURCE,
    });

    if (!createFeedItemResult.success) {
      logger.error(prefixError(createFeedItemResult.error, 'Error creating feed item'));
      process.exit(1);
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
