import {partition} from '@shared/lib/utils';

import {
  AsyncResult,
  ErrorResult,
  makeErrorResult,
  makeSuccessResult,
  Result,
  SuccessResult,
} from '@shared/types/result.types';
import {Supplier} from '@shared/types/utils.types';

/**
 * Upgrades an unknown error into a proper `Error` object with the best message possible.
 */
export function upgradeUnknownError(unknownError: unknown): Error {
  const defaultErrorMessage = 'An unexpected error occurred';
  if (unknownError instanceof Error) {
    return new Error(`${unknownError.message || defaultErrorMessage}`, {cause: unknownError});
  }
  if (typeof unknownError === 'string' && unknownError.length > 0) {
    return new Error(unknownError, {cause: unknownError});
  }
  // `String` provides better inspect than `JSON.stringify` for remaining types.
  return new Error(
    `Expected error, but caught \`${String(unknownError)}\` (${typeof unknownError})`,
    {cause: unknownError}
  );
}

/**
 * Executes the given synchronous function and returns its result. Errors should never be thrown.
 * Instead, a `ErrorResult` is returned.
 *
 * For asynchronous functions, see {@link asyncTry}.
 */
export function syncTry<T>(fn: Supplier<T>): Result<T> {
  try {
    const result = fn();
    return makeSuccessResult(result);
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    return makeErrorResult(betterError);
  }
}

/**
 * Executes the given asynchronous function and returns its result. Errors should never be thrown.
 * Instead, a `ErrorResult` is returned.
 *
 * For synchronous functions, see {@link syncTry}.
 */
export async function asyncTry<T>(asyncFn: Supplier<Promise<T>>): AsyncResult<T> {
  try {
    const result = await asyncFn();
    return makeSuccessResult(result);
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    return makeErrorResult(betterError);
  }
}

/**
 * Executes the given `AsyncResult`s in parallel and returns a single `SuccessResult<T>` with their
 * results. If any of the results fail, an array of `ErrorResult`s is returned.
 */
export async function asyncTryAll<T>(
  asyncResults: Array<AsyncResult<unknown>>
): AsyncResult<T, Error[]> {
  try {
    const results = await Promise.all(asyncResults);
    const [succeededResults, failedResults] = partition<SuccessResult<unknown>, ErrorResult>(
      results,
      (result) => result.success
    );
    if (failedResults.length > 0) {
      return makeErrorResult(failedResults.map((result) => result.error));
    }
    const succeededValues = succeededResults.map((result) => result.value);
    return makeSuccessResult(succeededValues as T);
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    return makeErrorResult([betterError]);
  }
}

/**
 * Executes the given `Promise`s in parallel and returns a single `SuccessResult<T>` with their
 * results. If any of the promises fail, a single `ErrorResult` is returned.
 */
export async function asyncTryAllPromises<T>(
  asyncFns: Array<Promise<unknown>>
): AsyncResult<T, Error[]> {
  try {
    const results = await Promise.allSettled(asyncFns);
    const [fulfilled, rejected] = partition(results, (result) => result.status === 'fulfilled');
    if (rejected.length > 0) {
      const errors = rejected.map((result) =>
        upgradeUnknownError((result as PromiseRejectedResult).reason)
      );
      return makeErrorResult(errors);
    }
    const values = fulfilled.map((result) => (result as PromiseFulfilledResult<unknown>).value);
    return makeSuccessResult(values as T);
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    return makeErrorResult([betterError]);
  }
}
