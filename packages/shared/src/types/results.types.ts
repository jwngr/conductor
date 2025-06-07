interface BaseResult {
  readonly success: boolean;
}

export interface SuccessResult<T> extends BaseResult {
  readonly success: true;
  readonly value: T;
}

export interface ErrorResult<E> extends BaseResult {
  readonly success: false;
  readonly error: E;
}

/**
 * A result of an operation that may either succeed or fail. Instead of throwing an error, the
 * result is returned as a value which must be handled by the caller.
 *
 * Always prefer `Result` over throwing errors.
 */
export type Result<T, E> = SuccessResult<T> | ErrorResult<E>;

export type AsyncResult<T, E> = Promise<Result<T, E>>;
