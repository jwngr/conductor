import {AsyncConsumer, AsyncFunc, Supplier} from '@shared/types/utils.types';

interface BaseTryWithErrorMessageArg<T> {
  /*
   * Optional callback fired immediately before the function is executed.
   */
  readonly onBefore?: AsyncConsumer<void>;
  /*
   * Optional callback fired if the function succeeds, with the function's result.
   */
  readonly onSuccess?: AsyncConsumer<T>;
  /*
   * Required error callback to ensure a value of type `T` is always returned. Almost every caller
   * should at the very least log an error. Most should handle the error gracefully for the user.
   */
  readonly onError: AsyncFunc<Error, T>;
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
 * Executes the given synchronous function and returns its result.
 *
 * Notes:
 * - This function is async even though you provide a synchronous callback. The `onError` callback
 *   can be async, which is why this function is async.
 * - The `onError` callback is provided with an upgraded error.
 *
 * For asynchronous functions, see {@link asyncTryWithErrorMessage}.
 */
export async function tryWithErrorMessage<T>(args: SyncTryWithErrorMessageArgs<T>): Promise<T> {
  const {fn, onBefore, onSuccess, onError} = args;
  try {
    if (onBefore) await onBefore();
    const result = fn();
    if (onSuccess) await onSuccess(result);
    return result;
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    const onErrorResult = await onError(betterError);
    return onErrorResult;
  }
}

/**
 * Executes the given asynchronous function and returns its result.
 *
 * Notes:
 * - The `onError` callback is provided with an upgraded error.
 *
 * For synchronous functions, see {@link tryWithErrorMessage}.
 */
export async function asyncTryWithErrorMessage<T>(
  args: AsyncTryWithErrorMessageArgs<T>
): Promise<T> {
  const {asyncFn, onBefore, onError, onSuccess} = args;
  try {
    if (onBefore) await onBefore();
    const result = await asyncFn();
    if (onSuccess) await onSuccess(result);
    return result;
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    const onErrorResult = await onError(betterError);
    return onErrorResult;
  }
}
