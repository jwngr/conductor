import path from 'path';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import {writeJsonFile} from '@sharedServer/lib/fs.server';
import {ServerPocketService} from '@sharedServer/lib/pocket.server';

const args = process.argv.slice(2);
if (args.length !== 2) {
  logger.error(new Error('No Pocket export file path provided'));
  logger.log(`Usage: node ${process.argv[1]} <path/to/pocket/export.csv> <output.json>`);
  process.exit(1);
}

const POCKET_EXPORT_FILE_PATH = path.resolve(args[0]);
const OUTPUT_FILE_PATH = path.resolve(args[1]);

async function main(): Promise<void> {
  const parseResult = await ServerPocketService.parseCsvExportFile(POCKET_EXPORT_FILE_PATH);
  if (!parseResult.success) {
    return logAndExit(prefixError(parseResult.error, 'Error parsing Pocket CSV export file'));
  }
  const pocketItems = parseResult.value;

  const writeJsonResult = await writeJsonFile(OUTPUT_FILE_PATH, pocketItems);
  if (!writeJsonResult.success) {
    return logAndExit(prefixError(writeJsonResult.error, 'Error writing JSON to file'));
  }

  logger.log(`Successfully wrote ${pocketItems.length} items to ${OUTPUT_FILE_PATH}`);
}

function logAndExit(error: Error): void {
  logger.error(error);
  process.exit(1);
}

void main();
