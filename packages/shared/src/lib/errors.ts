import {Func, Supplier} from '@shared/types/utils.types';

interface TryWithErrorMessageArgs<T> {
  readonly fn: Supplier<T>;
  readonly onError: Func<Error, T>;
  readonly errorMessagePrefix?: string;
}

export function tryWithErrorMessage<T>({
  fn,
  onError,
  errorMessagePrefix,
}: TryWithErrorMessageArgs<T>): T {
  try {
    return fn();
  } catch (error) {
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
}

interface AsyncTryWithErrorMessageArgs<T> {
  readonly asyncFn: Supplier<Promise<T>>;
  readonly onError: Func<Error, T>;
  readonly errorMessagePrefix?: string;
}

export async function asyncTryWithErrorMessage<T>({
  asyncFn,
  onError,
  errorMessagePrefix,
}: AsyncTryWithErrorMessageArgs<T>): Promise<T> {
  try {
    return await asyncFn();
  } catch (error) {
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
}
