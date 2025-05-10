import type {
  ErrorAsyncState,
  IdleAsyncState,
  PendingAsyncState,
  SuccessAsyncState,
} from '@shared/types/asyncState.type';
import {AsyncStatus} from '@shared/types/asyncState.type';

export const IDLE_ASYNC_STATE: IdleAsyncState = {status: AsyncStatus.Idle} as const;

export const PENDING_ASYNC_STATE: PendingAsyncState = {status: AsyncStatus.Pending} as const;

export function makeErrorAsyncState(error: Error): ErrorAsyncState {
  return {status: AsyncStatus.Error, error};
}

export function makeSuccessAsyncState<T>(value: T): SuccessAsyncState<T> {
  return {status: AsyncStatus.Success, value};
}
