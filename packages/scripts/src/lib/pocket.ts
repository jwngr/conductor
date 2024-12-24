import fs from 'fs/promises';

import {JSDOM} from 'jsdom';

import type {PocketExportedItem} from '../types/pocket';

export class PocketService {
  static async parseExportFromFile(path: string): Promise<readonly PocketExportedItem[]> {
    // eslint-disable-next-line no-restricted-syntax
    try {
      const fileContent = await fs.readFile(path, 'utf-8');
      return this.parseExport(fileContent);
    } catch (error) {
      if (error instanceof Error) {
        error.message = `Failed to parse Pocket export: ${error.message}`;
      }
      throw error;
    }
  }

  static async parseExport(exportContent: string): Promise<readonly PocketExportedItem[]> {
    const dom = new JSDOM(exportContent);
    const document = dom.window.document;

    const items: PocketExportedItem[] = [];
    const listItems = document.querySelectorAll('ul > li');

    listItems.forEach((li) => {
      const anchor = li.querySelector('a');
      if (anchor) {
        const timeAddedString = anchor.getAttribute('time_added');

        items.push({
          href: anchor.getAttribute('href') ?? '',
          title: anchor.textContent ?? '',
          timeAdded: timeAddedString ? parseInt(timeAddedString, 10) : 0,
        });
      }
    });

    return items;
  }
}
