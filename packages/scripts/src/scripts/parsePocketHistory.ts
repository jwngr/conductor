import fs from 'fs/promises';

import {PocketService} from '@src/lib/pocket';

import type {PocketExportedItem} from '@src/types/pocket.types';

const EXPORT_FILE_PATH = '@src/resources/pocketExport.html';

async function main(): Promise<void> {
  // eslint-disable-next-line no-restricted-syntax
  try {
    const pocketItems = await PocketService.parseExportFromFile(EXPORT_FILE_PATH);

    // output to tsv file: url, title, time_added
    const tsv = pocketItems
      .map((item: PocketExportedItem) =>
        [escapeTabField(item.href), escapeTabField(item.title), item.timeAdded.toString()].join(
          '\t'
        )
      )
      .join('\n');

    await fs.writeFile('pocket_history.tsv', tsv, 'utf-8');

    // await Promise.all(pocketItems.slice(1000, 2000).map(async (item) => testIfValidUrl(item.url)));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing Pocket export:', error);
  }
}

// Helper function to escape TSV fields
function escapeTabField(field: string): string {
  return field.replace(/\t/g, ' ').replace(/\n/g, ' ');
}

void main();
