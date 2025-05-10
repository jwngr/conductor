export enum AsyncStatus {
  /** The initial state of an async operation, before it has started. */
  Idle = 'IDLE',
  /** The state of an async operation that is currently in progress. */
  Pending = 'PENDING',
  /** The state of an async operation that failed. */
  Error = 'ERROR',
  /** The state of an async operation that succeeded. */
  Success = 'SUCCESS',
}

interface BaseAsyncState {
  readonly status: AsyncStatus;
}

export interface IdleAsyncState extends BaseAsyncState {
  readonly status: AsyncStatus.Idle;
}

export interface PendingAsyncState extends BaseAsyncState {
  readonly status: AsyncStatus.Pending;
}

export interface ErrorAsyncState extends BaseAsyncState {
  readonly status: AsyncStatus.Error;
  readonly error: Error;
}

export interface SuccessAsyncState<T> extends BaseAsyncState {
  readonly status: AsyncStatus.Success;
  readonly value: T;
}

export type AsyncState<T> =
  | IdleAsyncState
  | PendingAsyncState
  | ErrorAsyncState
  | SuccessAsyncState<T>;
