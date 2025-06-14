import {v4 as uuidv4} from 'uuid';

import {logger} from '@shared/services/logger.shared';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult, Result} from '@shared/types/results.types';
import type {Func, Supplier, UUID} from '@shared/types/utils.types';

/**
 * Formats a number with commas.
 *
 * TODO: Use a more robust solution that works with internationalization.
 */
export const formatWithCommas = (val: number): string => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

interface AssertNeverOptions {
  /** Test-only option to avoid noisy logs for the `assertNever` tests themselves. */
  readonly testNoLog?: boolean;
}

const DEFAULT_ASSERT_NEVER_OPTIONS: AssertNeverOptions = {
  testNoLog: false,
};

/**
 * Throws an error and throws if the provided value is not of type `never`. This is useful for
 * exhaustive switch statements. In rare scenarios where input is untrusted and throwing is unsafe
 * (e.g. parsers), use {@link safeAssertNever} instead.
 */
export function assertNever(
  val: never,
  options: AssertNeverOptions = DEFAULT_ASSERT_NEVER_OPTIONS
): never {
  const {testNoLog = false} = options;
  if (!testNoLog) {
    logger.error(new Error('assertNever received non-empty value'), {val});
  }
  // eslint-disable-next-line no-restricted-syntax
  throw new Error(`Unexpected value: ${val}`);
}

/**
 * Logs an error if the provided value is not of type `never`. This is useful for exhaustive
 * switch statements. In most cases, use {@link assertNever} instead.
 */
export function safeAssertNever(val: never): void {
  logger.error(new Error('safeAssertNever received non-empty value'), {val});
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
  syncResultSuppliers: Array<Supplier<Result<T, Error>>>,
  batchSize: number
): Result<Array<Result<T, Error>>, Error> {
  if (batchSize < 1) {
    return makeErrorResult(new Error(`Batch size must be at least 1: ${batchSize}`));
  }

  const resultsPerBatch: Array<Array<Supplier<Result<T, Error>>>> = [];
  for (let i = 0; i < syncResultSuppliers.length; i += batchSize) {
    resultsPerBatch.push(syncResultSuppliers.slice(i, i + batchSize));
  }

  const allResults: Array<Result<T, Error>> = [];
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
  asyncResultSuppliers: Array<Supplier<AsyncResult<T, Error>>>,
  batchSize: number
): AsyncResult<Array<Result<T, Error>>, Error> {
  if (batchSize < 1) {
    return makeErrorResult(new Error(`Batch size must be at least 1: ${batchSize}`));
  }

  const resultsPerBatch: Array<Array<Supplier<AsyncResult<T, Error>>>> = [];
  for (let i = 0; i < asyncResultSuppliers.length; i += batchSize) {
    resultsPerBatch.push(asyncResultSuppliers.slice(i, i + batchSize));
  }

  const allResults: Array<Result<T, Error>> = [];
  for (const currentSuppliers of resultsPerBatch) {
    const currentResults = await Promise.all(currentSuppliers.map(async (supplier) => supplier()));
    allResults.push(...currentResults);
  }
  return makeSuccessResult(allResults);
}

/**
 * Partitions an array into two arrays based on the provided predicate.
 */
export function partition<T, U>(
  arr: ReadonlyArray<T | U>,
  predicate: Func<T | U, boolean>
): [T[], U[]] {
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

/**
 * Returns a pluralized string, not including the count.
 *
 * If `plural` is not provided, the string will be pluralized using the singular string and a basic
 * heuristic.
 *
 * TODO: Use a more proper localization library which handles internationalization.
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (!plural) {
    const pluralized = singular.endsWith('s') ? `${singular}es` : `${singular}s`;
    return count === 1 ? singular : pluralized;
  }
  return count === 1 ? singular : plural;
}

/**
 * Returns a pluralized string, including the count.
 *
 * If `plural` is not provided, the string will be pluralized using the singular string and a basic
 * heuristic.
 *
 * TODO: Use a more proper localization library which handles internationalization.
 */
export function pluralizeWithCount(count: number, singular: string, plural?: string): string {
  return `${formatWithCommas(count)} ${pluralize(count, singular, plural)}`;
}

/**
 * A no-op function.
 *
 * This is useful for providing a function to callbacks that are not used.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}

/**
 * A no-op function that returns `true`.
 *
 * This is useful for providing a function to callbacks that should always return `true`.
 */
export function noopTrue(): true {
  return true;
}

/**
 * A no-op function that returns `false`.
 *
 * This is useful for providing a function to callbacks that should always return `false`.
 */
export function noopFalse(): false {
  return false;
}

/**
 * Returns `true` if the provided value is a valid port number.
 */
export function isValidPort(port: number): boolean {
  return port >= 0 && port <= 65535;
}

/**
 * Returns `true` if the provided value is an integer.
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

/**
 * Returns `true` if the provided value is a positive integer.
 */
export function isPositiveInteger(value: number): boolean {
  return isInteger(value) && value > 0;
}

/**
 * Returns a new typed array with the same length, but each value having been filtered by `filter`.
 */
export function filterArray<T>(arr: T[], filter: Func<T, boolean>): T[] {
  return arr.filter(filter);
}

/**
 * Returns a new typed array with the same length, but each value having been transformed by
 * `mapper`.
 */
export function mapArray<Start, End>(arr: Start[], mapper: Func<Start, End>): End[] {
  return arr.map(mapper);
}

/**
 * Returns a new typed object with the same keys, but each value having been transformed by
 * `mapper`.
 */
export function mapObjectValues<Key extends string, Start, End>(
  obj: Partial<Record<Key, Start>>,
  mapper: Func<Start, End>,
  filter?: Func<Key, boolean>
): Record<Key, End> {
  const entries = Object.entries(obj).map(([key, value]) => [key as Key, mapper(value as Start)]);
  const filteredEntries = filter ? filterArray(entries, ([key]) => filter(key as Key)) : entries;
  return Object.fromEntries(filteredEntries);
}

export function isDefined<T>(val: T | undefined): val is T {
  return val !== undefined;
}
