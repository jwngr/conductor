import {partition} from '@shared/lib/utils.shared';

import type {ErrorResult, Result, SuccessResult} from '@shared/types/results.types';

/**
 * Creates a success result.
 */
export function makeSuccessResult<T>(value: T): SuccessResult<T> {
  return {success: true, value};
}

/**
 * Creates an error result.
 */
export function makeErrorResult<E = Error>(error: E): ErrorResult<E> {
  return {success: false, error};
}

/**
 * Partitions an array of results into successful and errored results.
 */
export function partitionResults<T, E = Error>(
  results: ReadonlyArray<Result<T, E>>
): {
  readonly successes: ReadonlyArray<SuccessResult<T>>;
  readonly errors: ReadonlyArray<ErrorResult<E>>;
} {
  const [successes, errors] = partition<SuccessResult<T>, ErrorResult<E>>(
    results,
    (result) => result.success
  );
  return {successes, errors};
}
