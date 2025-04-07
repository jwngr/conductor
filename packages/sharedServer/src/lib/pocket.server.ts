import {readFile} from 'fs/promises';

import {JSDOM} from 'jsdom';

import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {PocketImportItem} from '@shared/types/pocket.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {AsyncResult, Result} from '@shared/types/result.types';

export class ServerPocketService {
  static async parseExportFromFile(path: string): AsyncResult<readonly PocketImportItem[]> {
    const readFileResult = await asyncTry(async () => readFile(path, 'utf-8'));
    if (!readFileResult.success) {
      return prefixErrorResult(readFileResult, 'Error reading Pocket export file');
    }

    const fileContent = readFileResult.value;

    const parseExportResult = this.parseExport(fileContent);
    return prefixResultIfError(parseExportResult, 'Error parsing Pocket export');
  }

  static parseExport(exportContent: string): Result<readonly PocketImportItem[]> {
    const dom = new JSDOM(exportContent);
    const document = dom.window.document;

    const items: PocketImportItem[] = [];
    const listItems = document.querySelectorAll('ul > li');

    listItems.forEach((li) => {
      const anchor = li.querySelector('a');
      if (anchor) {
        const timeAddedString = anchor.getAttribute('time_added');

        items.push({
          url: anchor.getAttribute('href') ?? '',
          title: anchor.textContent ?? '',
          timeAddedMs: timeAddedString ? parseInt(timeAddedString, 10) * 1000 : 0,
        });
      }
    });

    return makeSuccessResult(items);
  }
}
