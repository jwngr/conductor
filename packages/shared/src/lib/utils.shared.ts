import {v4 as uuidv4} from 'uuid';

import type {AsyncResult, Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {EmailAddress, Func, Supplier, UUID} from '@shared/types/utils.types';

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
  // eslint-disable-next-line no-restricted-syntax
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

/**
 * Omits all undefined values from the provided object.
 */
export function omitUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/**
 * Runs all of the provided sync task suppliers in batches of a given size. If the number of tasks
 * is less than the batch size, all tasks are run in parallel. Tasks are not executed until this
 * function is called.
 */
export function batchSyncResults<T>(
  syncResultSuppliers: Array<Supplier<Result<T>>>,
  batchSize: number
): Result<Array<Result<T>>> {
  if (batchSize < 1) {
    return makeErrorResult(new Error(`Batch size must be at least 1: ${batchSize}`));
  }

  const resultsPerBatch: Array<Array<Supplier<Result<T>>>> = [];
  for (let i = 0; i < syncResultSuppliers.length; i += batchSize) {
    resultsPerBatch.push(syncResultSuppliers.slice(i, i + batchSize));
  }

  const allResults: Array<Result<T>> = [];
  for (const currentSuppliers of resultsPerBatch) {
    const currentResults = currentSuppliers.map((supplier) => supplier());
    allResults.push(...currentResults);
  }
  return makeSuccessResult(allResults);
}

/**
 * Runs all of the provided async task suppliers in batches of a given size. If the number of tasks
 * is less than the batch size, all tasks are run in parallel. Tasks are not executed until this
 * function is called.
 */
export async function batchAsyncResults<T>(
  asyncResultSuppliers: Array<Supplier<AsyncResult<T>>>,
  batchSize: number
): AsyncResult<Array<Result<T>>> {
  if (batchSize < 1) {
    return makeErrorResult(new Error(`Batch size must be at least 1: ${batchSize}`));
  }

  const resultsPerBatch: Array<Array<Supplier<AsyncResult<T>>>> = [];
  for (let i = 0; i < asyncResultSuppliers.length; i += batchSize) {
    resultsPerBatch.push(asyncResultSuppliers.slice(i, i + batchSize));
  }

  const allResults: Array<Result<T>> = [];
  for (const currentSuppliers of resultsPerBatch) {
    const currentResults = await Promise.all(currentSuppliers.map((supplier) => supplier()));
    allResults.push(...currentResults);
  }
  return makeSuccessResult(allResults);
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
 * Generates a random v4 UUID.
 */
export function makeUuid<T = UUID>(): T {
  return uuidv4() as T;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checks if a value is a valid `EmailAddress`.
 */
export function isValidEmail(maybeEmail: unknown): maybeEmail is EmailAddress {
  return typeof maybeEmail === 'string' && EMAIL_REGEX.test(maybeEmail);
}

/**
 * Returns `true` if the provided value is a `Date`.
 */
export function isDate(value: unknown): value is Date {
  return typeof value === 'object' && value !== null && 'toDate' in value;
}
