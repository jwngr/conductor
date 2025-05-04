import {parse as parseCsvFromLib} from 'csv-parse/browser/esm/sync';

import {syncTry} from '@shared/lib/errorUtils.shared';

import type {Result} from '@shared/types/results.types';

export function parseCsv<T>(csvString: string): Result<readonly T[]> {
  const rawCsvRecordsResult = syncTry(
    () =>
      parseCsvFromLib(csvString, {
        columns: true,
        skip_empty_lines: true,
      }) as T[]
  );
  return rawCsvRecordsResult;
}
