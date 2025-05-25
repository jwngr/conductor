import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult, partitionResults} from '@shared/lib/results.shared';
import {pluralizeWithCount} from '@shared/lib/utils.shared';

import {parsePocketCsvRecord} from '@shared/types/pocket.types';
import type {PocketImportItem, RawPocketCsvRecord} from '@shared/types/pocket.types';
import type {Result} from '@shared/types/results.types';

import {parseCsv} from '@sharedClient/lib/csv.client';

/**
 * Parses CSV content string containing Pocket export data.
 * Expected format: title,url,time_added,tags,status
 */
export function parsePocketCsvContent(csvString: string): Result<readonly PocketImportItem[]> {
  const rawCsvRecordsResult = parseCsv<RawPocketCsvRecord>(csvString);
  if (!rawCsvRecordsResult.success) return rawCsvRecordsResult;

  const parsedCsvRecordResults = rawCsvRecordsResult.value.map(parsePocketCsvRecord);

  const {successes, errors} = partitionResults(parsedCsvRecordResults);
  if (errors.length > 0) {
    const betterErrorResult = prefixErrorResult(
      errors[0],
      `Error parsing ${pluralizeWithCount(errors.length, 'record')}. First error:`
    );
    return betterErrorResult;
  }

  const parsedCsvRecords = successes.map((result) => result.value);
  return makeSuccessResult(parsedCsvRecords);
}
