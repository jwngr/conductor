import {parse as parseCsvFromLib} from 'csv-parse/sync';

import {syncTry} from '@shared/lib/errorUtils.shared';

import type {Result} from '@shared/types/result.types';

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
