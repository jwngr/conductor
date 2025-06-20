import {useCallback, useState} from 'react';

import {
  IDLE_ASYNC_STATE,
  makeErrorAsyncState,
  makeSuccessAsyncState,
  PENDING_ASYNC_STATE,
} from '@shared/lib/asyncState.shared';

import type {AsyncState} from '@shared/types/asyncState.types';
import type {Consumer} from '@shared/types/utils.types';

/**
 * Useful for managing the state of an async operation. Returns a set of operations to manage the
 * state of the async operation. Also returns the current state of the successful async operation.
 *
 * @example
 * ```tsx
 * const {asyncState, setPending, setError, setSuccess} = useAsyncState<string>();
 *
 * const handleClick = useCallback(async (id: string) => {
 *   setPending();
 *   const result = await fetchNameById(id);
 *   if (!result.success) {
 *     setError(result.error);
 *     return;
 *   }
 *   setSuccess(result.data);
 * }, [setPending, setError, setSuccess]);
 *
 * switch (asyncState.status) {
 *   case AsyncStatus.Idle:
 *     return <button onClick={handleClick}>Click me</button>;
 *   case AsyncStatus.Pending:
 *     return <LoadingArea text="Loading..." />;
 *   case AsyncStatus.Error:
 *     return <ErrorArea error={asyncState.error} />;
 *   case AsyncStatus.Success:
 *     return <p>Hello {asyncState.value}</p>;
 *   default:
 *     assertNever(asyncState);
 * }
 * ```
 */
export function useAsyncState<T>(): {
  readonly asyncState: AsyncState<T>;
  readonly setPending: Consumer<void>;
  readonly setError: Consumer<Error>;
  readonly setSuccess: Consumer<T>;
  readonly setAsyncState: Consumer<AsyncState<T>>;
} {
  const [asyncState, setAsyncState] = useState<AsyncState<T>>(IDLE_ASYNC_STATE);

  const setPending = useCallback(() => setAsyncState(PENDING_ASYNC_STATE), []);
  const setError = useCallback((error: Error) => setAsyncState(makeErrorAsyncState(error)), []);
  const setSuccess = useCallback((value: T) => setAsyncState(makeSuccessAsyncState(value)), []);

  return {asyncState, setPending, setError, setSuccess, setAsyncState};
}
