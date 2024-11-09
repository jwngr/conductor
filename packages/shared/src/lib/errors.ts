import {Func, Supplier} from '@shared/types/utils.types';

interface BaseTryWithErrorMessageArg<T> {
  readonly onError: Func<Error, T>;
  readonly errorMessagePrefix?: string;
}

interface SyncTryWithErrorMessageArgs<T> extends BaseTryWithErrorMessageArg<T> {
  readonly fn: Supplier<T>;
}

interface AsyncTryWithErrorMessageArgs<T> extends BaseTryWithErrorMessageArg<T> {
  readonly asyncFn: Supplier<Promise<T>>;
}

/**
 * Handles an error by creating a better error message and calling `onError` with it.
 */
function handleError<T>(error: unknown, onError: Func<Error, T>, errorMessagePrefix?: string): T {
  let betterError: Error;
  const prefix = errorMessagePrefix ? `${errorMessagePrefix}: ` : '';
  if (error instanceof Error) {
    betterError = new Error(`${prefix}${error.message}`, {cause: error});
  } else {
    const defaultErrorMessage = 'An unexpected error occurred';
    betterError = new Error(`${prefix}${error ?? defaultErrorMessage}`);
  }

  return onError(betterError);
}

/**
 * Executes the given synchronous function and returns its result. If an error is thrown, it is
 * caught and returned as an error with a better message.
 *
 * For asynchronous functions, see {@link asyncTryWithErrorMessage}.
 */
export function tryWithErrorMessage<T>({
  fn,
  onError,
  errorMessagePrefix,
}: SyncTryWithErrorMessageArgs<T>): T {
  try {
    return fn();
  } catch (error) {
    return handleError(error, onError, errorMessagePrefix);
  }
}

/**
 * Executes the given asynchronous function and returns its result. If an error is thrown, it is
 * caught and returned as an error with a better message.
 *
 * For synchronous functions, see {@link tryWithErrorMessage}.
 */
export async function asyncTryWithErrorMessage<T>({
  asyncFn,
  onError,
  errorMessagePrefix,
}: AsyncTryWithErrorMessageArgs<T>): Promise<T> {
  try {
    return await asyncFn();
  } catch (error) {
    return handleError(error, onError, errorMessagePrefix);
  }
}
