import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {partition} from '@shared/lib/utils.shared';

import type {AsyncResult, ErrorResult, Result, SuccessResult} from '@shared/types/results.types';
import type {Supplier} from '@shared/types/utils.types';

/** Default user-visible error message, intended for titles, such as on error pages. */
export const DEFAULT_ERROR_TITLE = 'Something went wrong';

/** Default error message when one cannot be parsed otherwise. */
export const UNEXPECTED_ERROR_DEFAULT_MESSAGE = 'An unexpected error occurred';

/**
 * Upgrades an unknown error into a proper `Error` object with the best message possible.
 */
export function upgradeUnknownError(unknownError: unknown): Error {
  // Unknown error is already an `Error` object.
  if (unknownError instanceof Error) {
    return new Error(unknownError.message || UNEXPECTED_ERROR_DEFAULT_MESSAGE, {
      cause: unknownError.cause instanceof Error ? unknownError.cause : unknownError,
    });
  }

  // Unknown error is a string.
  if (typeof unknownError === 'string' && unknownError.length > 0) {
    return new Error(unknownError, {cause: unknownError});
  }

  if (typeof unknownError === 'object' && unknownError !== null) {
    // Unknown error is an object with a `message` property.
    if ('message' in unknownError) {
      return upgradeUnknownError(unknownError.message);
    }

    // Also recursively check the unknown error's `error` property.
    if ('error' in unknownError) {
      return upgradeUnknownError(unknownError.error);
    }
  }

  // Unknown error has an unexpected type.
  const stringifiedErrorResult = syncTry(() => JSON.stringify(unknownError));
  if (!stringifiedErrorResult.success) {
    // `JSON.stringify` may fail due to circular references.
    return new Error(
      `Expected error, but caught non-stringifiable object of type ${typeof unknownError}: \`${unknownError}\``,
      {cause: unknownError}
    );
  }

  return new Error(
    `Expected error, but caught \`${stringifiedErrorResult.value}\` (${typeof unknownError})`,
    {cause: unknownError}
  );
}

/**
 * Adds a prefix to the error message for a known `Error`.
 */
export function prefixError(error: Error, prefix: string): Error {
  const newError = new Error(`${prefix}: ${error.message}`, {
    cause: error.cause instanceof Error ? error.cause : error,
  });
  return newError;
}

/**
 * Returns a new `ErrorResult` matching the provided `ErrorResult` but with an additional prefix.
 */
export function prefixErrorResult(
  errorResult: ErrorResult<Error>,
  errorPrefix: string
): ErrorResult<Error> {
  return makeErrorResult(prefixError(errorResult.error, errorPrefix));
}

/**
 * If the provided result is a `SuccessResult`, returns it unchanged. If it is an `ErrorResult`,
 * returns a new `ErrorResult` matching it but with an additional prefix.
 */
export function prefixResultIfError<T>(
  result: Result<T, Error>,
  errorPrefix: string
): Result<T, Error> {
  if (result.success) return result;
  return makeErrorResult(prefixError(result.error, errorPrefix));
}

/**
 * Executes the given synchronous function and returns its result. A thrown error is converted into
 * an `ErrorResult`.
 *
 * For asynchronous functions, see {@link asyncTry}.
 */
export function syncTry<T>(fn: Supplier<T>): Result<T, Error> {
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
 * Executes the given synchronous functions and returns their results. If any of the functions
 * return an `ErrorResult`, the first error will be returned as an `ErrorResult`.
 *
 * For asynchronous functions, see {@link asyncTryAll}.
 */
export function syncTryAll<T>(allResults: Array<Result<T, Error>>): Result<T[], Error> {
  // Allow `try` / `catch` block here.
  // eslint-disable-next-line no-restricted-syntax
  try {
    const [successResults, failedResults] = partition<SuccessResult<T>, ErrorResult<Error>>(
      allResults,
      (result) => result.success
    );
    if (failedResults.length > 0) {
      // Just use the first failed result as the error and ignore the rest.
      return makeErrorResult(failedResults[0].error);
    }
    const allResultValues = successResults.map((result) => result.value);
    return makeSuccessResult(allResultValues);
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    return makeErrorResult(betterError);
  }
}

/**
 * Executes the given asynchronous function and returns its result. Errors should never be thrown.
 * Instead, an `ErrorResult` is returned.
 *
 * For synchronous functions, see {@link syncTry}.
 */
export async function asyncTry<T>(asyncFn: Supplier<Promise<T>>): AsyncResult<T, Error> {
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
  asyncResults: readonly [...{[K in keyof T]: AsyncResult<T[K], Error>}]
): AsyncResult<
  {
    readonly success: boolean;
    readonly results: {[K in keyof T]: Result<T[K], Error>};
  },
  Error
> {
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
 * Executes the given `Promise`s in parallel and returns a single `SuccessResult<T, Error>` with their
 * results. Returns only once all promises have been resolved.
 *
 * Only returns an `ErrorResult` if something unexpected happens. A failed promise is not considered
 * an error and will not prevent other promises from executing. Use the `success` field to see if
 * any promises failed.
 */
export async function asyncTryAllPromises<T extends readonly unknown[]>(
  asyncFns: readonly [...{[K in keyof T]: Promise<T[K]>}]
): AsyncResult<
  {
    readonly success: boolean;
    readonly results: {[K in keyof T]: Result<T[K], Error>};
  },
  Error
> {
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
    }) as {[K in keyof T]: Result<T[K], Error>};

    return makeSuccessResult({
      success: !hasError,
      results: allResults,
    });
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    return makeErrorResult(betterError);
  }
}
