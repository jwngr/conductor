import type {AsyncResult} from '@shared/types/results.types';
import type {Func, Supplier} from '@shared/types/utils.types';

export type UndoAction = Supplier<AsyncResult<void>>;

interface UndoableActionArgs {
  readonly isActive: boolean;
}

export type UndoableActionFn = Func<UndoableActionArgs, AsyncResult<void>>;
