import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';
import {pluralizeWithCount} from '@shared/lib/utils.shared';

import type {PocketImportItem} from '@shared/types/pocket.types';

import {ServerPocketService} from '@sharedServer/lib/pocket.server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Download file from https://getpocket.com/export.
const POCKET_EXPORT_FILE_PATH = path.resolve(__dirname, '../resources/pocketExport.html');

const OUTPUT_FILE_PATH = path.resolve(__dirname, '../resources/pocketHistory.tsv');

async function main(): Promise<void> {
  const pocketItemsResult = await ServerPocketService.parseExportFromFile(POCKET_EXPORT_FILE_PATH);

  if (!pocketItemsResult.success) {
    logger.error(prefixError(pocketItemsResult.error, 'Error parsing Pocket export file'));
    process.exit(1);
  }

  const itemsWithCount = pluralizeWithCount(pocketItemsResult.value.length, 'item', 'items');
  logger.log(`Successfully parsed Pocket export with ${itemsWithCount}.`);

  const pocketItems = pocketItemsResult.value;

  const tsvFields = pocketItems
    .map((item: PocketImportItem) =>
      [escapeFieldForTsv(item.href), escapeFieldForTsv(item.title), item.timeAdded.toString()].join(
        '\t'
      )
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
