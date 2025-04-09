/**
 * A result of an operation that may either succeed or fail. Instead of throwing an error, the
 * result is returned as a value which must be handled by the caller.
 *
 * Always prefer `Result` over throwing errors.
 */

import {partition} from '@shared/lib/utils.shared';

interface BaseResult {
  readonly success: boolean;
}

export interface SuccessResult<T> extends BaseResult {
  readonly success: true;
  readonly value: T;
}

export interface ErrorResult<E = Error> extends BaseResult {
  readonly success: false;
  readonly error: E;
}

export function makeSuccessResult<T>(value: T): SuccessResult<T> {
  return {success: true, value};
}

export function makeErrorResult<E = Error>(error: E): ErrorResult<E> {
  return {success: false, error};
}

export type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

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
