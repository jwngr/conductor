import {JSDOM} from 'jsdom';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult, partitionResults} from '@shared/lib/results.shared';
import {pluralizeWithCount} from '@shared/lib/utils.shared';

import {parsePocketCsvRecord} from '@shared/types/pocket.types';
import type {PocketImportItem, RawPocketCsvRecord} from '@shared/types/pocket.types';
import type {AsyncResult} from '@shared/types/results.types';

import {parseCsv} from '@sharedServer/lib/csv.server';
import {readFile} from '@sharedServer/lib/fs.server';

export class ServerPocketService {
  /**
   * Parses a CSV file containing Pocket export data with the following format:
   * title,url,time_added,tags,status
   * This file can be downloaded from https://getpocket.com/export.
   */
  static async parseCsvExportFile(
    filePath: string
  ): AsyncResult<readonly PocketImportItem[], Error> {
    const fileContentResult = await readFile(filePath, 'utf-8');
    if (!fileContentResult.success) return fileContentResult;

    const rawCsvRecordsResult = parseCsv<RawPocketCsvRecord>(fileContentResult.value);
    if (!rawCsvRecordsResult.success) return rawCsvRecordsResult;

    const parsedCsvRecordResults = rawCsvRecordsResult.value.map(parsePocketCsvRecord);

    const {successes, errors} = partitionResults(parsedCsvRecordResults);
    if (errors.length > 0) {
      const betterErrorResult = prefixErrorResult(
        errors[0],
        `Error parsing ${pluralizeWithCount(errors.length, 'record', 'records')}. First error:`
      );
      return betterErrorResult;
    }

    const parsedCsvRecords = successes.map((result) => result.value);
    return makeSuccessResult(parsedCsvRecords);
  }

  /**
   * Parses an HTML file containing Pocket export data with the following format:
   * <li><a href="https://example.com/" time_added="1723323908" tags="">Example Title</a></li>
   *
   * @deprecated This appears to be a legacy format and more recent exports use {@link parseCsvExportFile}.
   */
  static async parseHtmlExportFile(path: string): AsyncResult<readonly PocketImportItem[], Error> {
    const readFileResult = await readFile(path, 'utf-8');
    if (!readFileResult.success) return readFileResult;

    const dom = new JSDOM(readFileResult.value);
    const document = dom.window.document;

    const pocketItems: PocketImportItem[] = [];
    const rawListItems = document.querySelectorAll('ul > li');

    rawListItems.forEach((li) => {
      const anchor = li.querySelector('a');
      if (anchor) {
        const timeAddedString = anchor.getAttribute('time_added');

        pocketItems.push({
          url: anchor.getAttribute('href') ?? '',
          title: anchor.textContent ?? '',
          timeAddedMs: timeAddedString ? parseInt(timeAddedString, 10) * 1000 : 0,
          tags: (anchor.getAttribute('tags')?.split(',') ?? [])
            .map((tag) => tag.trim())
            .filter(Boolean),
          // This field is not present in the HTML export file, so just default to unread.
          status: 'unread',
        });
      }
    });

    return makeSuccessResult(pocketItems);
  }
}
