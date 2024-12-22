import {AsyncResult, makeErrorResult, makeSuccessResult, Result} from '@shared/types/result.types';
import {Supplier} from '@shared/types/utils.types';

/**
 * Upgrades an unknown error into a proper `Error` object with the best message possible.
 */
export function upgradeUnknownError(unknownError: unknown): Error {
  const defaultErrorMessage = 'An unexpected error occurred';
  if (unknownError instanceof Error) {
    return new Error(unknownError.message || defaultErrorMessage, {cause: unknownError});
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
 * Adds a prefix to the error message for a known `Error`.
 */
export function prefixError(error: Error, prefix: string): Error {
  return new Error(`${prefix}: ${error.message}`, {cause: error});
}

/**
 * Executes the given synchronous function and returns its result. Errors should never be thrown.
 * Instead, a `ErrorResult` is returned.
 *
 * For asynchronous functions, see {@link asyncTry}.
 */
export function syncTry<T>(fn: Supplier<T>): Result<T> {
  // Allow `try` / `catch` block here.
  // eslint-disable-next-line no-restricted-syntax
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
  // Allow `try` / `catch` block here.
  // eslint-disable-next-line no-restricted-syntax
  try {
    const result = await asyncFn();
    return makeSuccessResult(result);
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    return makeErrorResult(betterError);
  }
}

/**
 * Executes the given `AsyncResult`s in parallel and returns a single `SuccessResult` with their
 * results. Returns only once all promises have been resolved.
 *
 * Only returns an `ErrorResult` if something unexpected happens. A failed promise is not considered
 * an error and will not prevent other promises from executing. Use the `success` field to see if
 * any promises failed.
 */
export async function asyncTryAll<T extends readonly unknown[]>(
  asyncResults: readonly [...{[K in keyof T]: AsyncResult<T[K]>}]
): AsyncResult<{
  readonly success: boolean;
  readonly results: {[K in keyof T]: Result<T[K]>};
}> {
  // Allow `try` / `catch` block here.
  // eslint-disable-next-line no-restricted-syntax
  try {
    const allResults = await Promise.all(asyncResults);
    const failedResults = allResults.filter((result) => !result.success);
    return makeSuccessResult({
      success: failedResults.length === 0,
      results: allResults,
    });
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    return makeErrorResult(betterError);
  }
}

/**
 * Executes the given `Promise`s in parallel and returns a single `SuccessResult<T>` with their
 * results. Returns only once all promises have been resolved.
 *
 * Only returns an `ErrorResult` if something unexpected happens. A failed promise is not considered
 * an error and will not prevent other promises from executing. Use the `success` field to see if
 * any promises failed.
 */
export async function asyncTryAllPromises<T extends readonly unknown[]>(
  asyncFns: readonly [...{[K in keyof T]: Promise<T[K]>}]
): AsyncResult<{
  readonly success: boolean;
  readonly results: {[K in keyof T]: Result<T[K]>};
}> {
  // Allow `try` / `catch` block here.
  // eslint-disable-next-line no-restricted-syntax
  try {
    const allPromises = await Promise.allSettled(asyncFns);
    let hasError = false;
    const allResults = allPromises.map((result) => {
      if (result.status === 'fulfilled') {
        return makeSuccessResult(result.value);
      }
      hasError = true;
      return makeErrorResult(upgradeUnknownError(result.reason));
    }) as {[K in keyof T]: Result<T[K]>};

    return makeSuccessResult({
      success: !hasError,
      results: allResults,
    });
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    return makeErrorResult(betterError);
  }
}
