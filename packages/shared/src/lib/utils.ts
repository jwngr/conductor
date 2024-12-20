import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import {Func, Supplier} from '@shared/types/utils.types';

/**
 * Formats a number with commas.
 *
 * TODO: Use a more robust solution that works with internationalization.
 */
export const formatWithCommas = (val: number): string => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Throws an error if the provided value is not of type `never`. This is useful for exhaustive
 * switch statements.
 */
export function assertNever(x: never): never {
  // TODO: Add logging. Or a global error handler.
  throw new Error(`Unexpected object: ${x}`);
}

/**
 * Filters out all null values from the provided array.
 */
export function filterNull<T>(arr: Array<T | null>): T[] {
  return arr.filter(Boolean) as T[];
}

/**
 * Filters out all undefined values from the provided array.
 */
export function filterUndefined<T>(arr: Array<T | undefined>): T[] {
  return arr.filter(Boolean) as T[];
}

type UnknownAsyncResultSupplier = Supplier<AsyncResult<unknown>>;

/**
 * Runs all of the provided async task suppliers in batches of a given size. If the number of tasks is less
 * than the batch size, all tasks are run in parallel. Tasks are not executed until this function is called.
 */
export async function batchAsyncResults<T>(
  asyncResultSuppliers: UnknownAsyncResultSupplier[],
  batchSize: number
): AsyncResult<T> {
  if (batchSize < 1) {
    return makeErrorResult(new Error(`Batch size must be at least 1: ${batchSize}`));
  }

  const resultsPerBatch: UnknownAsyncResultSupplier[][] = [];
  for (let i = 0; i < asyncResultSuppliers.length; i += batchSize) {
    resultsPerBatch.push(asyncResultSuppliers.slice(i, i + batchSize));
  }

  const allResults: unknown[] = [];
  for (const currentSuppliers of resultsPerBatch) {
    const currentResults = await Promise.all(currentSuppliers.map((supplier) => supplier()));
    allResults.push(...currentResults);
  }
  return makeSuccessResult(allResults as T);
}

/**
 * Partitions an array into two arrays based on the provided predicate.
 */
export function partition<T, U>(arr: Array<T | U>, predicate: Func<T | U, boolean>): [T[], U[]] {
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

/**
 * Generates a random ID of the given length.
 *
 * TODO: Switch to UUIDs.
 */
export function makeId(length = 20): string {
  const validChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * validChars.length);
    result += validChars.charAt(randomIndex);
  }
  return result;
}
