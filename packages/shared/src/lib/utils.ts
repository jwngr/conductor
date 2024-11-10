import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import {Func} from '@shared/types/utils.types';

export const formatWithCommas = (val: number): string => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export function assertNever(x: never): never {
  // TODO: Add logging. Or a global error handler.
  throw new Error(`Unexpected object: ${x}`);
}

export function filterNull<T>(arr: (T | null)[]): T[] {
  return arr.filter(Boolean) as T[];
}

export function filterUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter(Boolean) as T[];
}

export function mapNull<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

export function mapUndefined<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

/**
 * Runs all of the provided `AsyncTask`s in batches of a given size. If the number of tasks is less
 * than the batch size, all tasks are run in parallel.
 */
export async function batchAsyncResults<T>(
  asyncResults: AsyncResult<unknown>[],
  batchSize: number
): AsyncResult<T> {
  if (batchSize < 1) {
    return makeErrorResult(new Error(`Batch size must be at least 1: ${batchSize}`));
  }

  const resultsPerBatch: AsyncResult<unknown>[][] = [];
  for (let i = 0; i < asyncResults.length; i += batchSize) {
    resultsPerBatch.push(asyncResults.slice(i, i + batchSize));
  }

  const allResults: unknown[] = [];
  for (const currentResults of resultsPerBatch) {
    allResults.push(...(await Promise.all(currentResults)));
  }
  return makeSuccessResult(allResults as T);
}

export function partition<T, U>(arr: (T | U)[], predicate: Func<T | U, boolean>): [T[], U[]] {
  return arr.reduce(
    (acc, item) => {
      if (predicate(item)) {
        acc[0].push(item as T);
      } else {
        acc[1].push(item as U);
      }
      return acc;
    },
    [[], []] as [T[], U[]]
  );
}
