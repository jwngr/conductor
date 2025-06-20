import {logger} from '@shared/services/logger.shared';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';

type PocketImportItemStatus = 'unread' | 'archive';

export interface PocketImportItem {
  readonly url: string;
  readonly title: string;
  readonly timeAddedMs: number;
  readonly tags: string[];
  readonly status: PocketImportItemStatus;
}

export interface RawPocketCsvRecord {
  readonly title: string;
  readonly url: string;
  readonly time_added: string;
  readonly tags: string;
  readonly status: string;
}

function parsePocketCsvRecordStatus(status: string): Result<PocketImportItemStatus, Error> {
  switch (status) {
    case 'unread':
      return makeSuccessResult('unread');
    case 'archive':
      return makeSuccessResult('archive');
    default:
      return makeErrorResult(new Error(`Unknown Pocket import item status: ${status}`));
  }
}

export function parsePocketCsvRecord(record: RawPocketCsvRecord): Result<PocketImportItem, Error> {
  const statusResult = parsePocketCsvRecordStatus(record.status);
  if (!statusResult.success) return statusResult;

  let timeAddedMs = parseInt(record.time_added, 10) * 1000;
  if (isNaN(timeAddedMs)) {
    logger.warn('Pocket CSV record has invalid time added', {record});
    timeAddedMs = 0;
  }

  return makeSuccessResult({
    url: record.url,
    title: record.title,
    timeAddedMs,
    tags: record.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    status: statusResult.value,
  });
}
