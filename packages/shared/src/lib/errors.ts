import {Func, Supplier} from '@shared/types/utils.types';

interface BaseTryWithErrorMessageArg<T> {
  /*
   * Error handling callback is required to ensure a value of type `T` is always returned. Most
   * callers should at the very least be logging the error. Most should be doing something else
   * to handle the error gracefully for the user.
   */
  readonly onError: Func<Error, T>;
}

interface SyncTryWithErrorMessageArgs<T> extends BaseTryWithErrorMessageArg<T> {
  /* The function to execute, which may throw an error. */
  readonly fn: Supplier<T>;
}

interface AsyncTryWithErrorMessageArgs<T> extends BaseTryWithErrorMessageArg<T> {
  /* The asynchronous function to execute, which may throw a synchronous or asynchronous error. */
  readonly asyncFn: Supplier<Promise<T>>;
}

/**
 * Upgrades an unknown error into a proper `Error` object with the best message possible.
 */
function upgradeUnknownError(error: unknown): Error {
  const defaultErrorMessage = 'An unexpected error occurred';
  if (error instanceof Error) {
    return new Error(`${error.message || defaultErrorMessage}`, {cause: error});
  }
  return new Error(`${error || defaultErrorMessage}`);
}

/**
 * Executes the given synchronous function and returns its result. If an error is thrown, it is
 * caught and returned as an error with a better message.
 *
 * For asynchronous functions, see {@link asyncTryWithErrorMessage}.
 */
export function tryWithErrorMessage<T>({fn, onError}: SyncTryWithErrorMessageArgs<T>): T {
  try {
    return fn();
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    return onError(betterError);
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
}: AsyncTryWithErrorMessageArgs<T>): Promise<T> {
  try {
    return await asyncFn();
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    return onError(betterError);
  }
}
