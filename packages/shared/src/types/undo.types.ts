import type {AsyncResult} from '@shared/types/results.types';
import type {Func, Supplier} from '@shared/types/utils.types';

export type UndoAction = Supplier<AsyncResult<void>>;

interface UndoableActionArgs {
  readonly isActive: boolean;
}

export interface UndoableAction {
  readonly undoAction: UndoAction;
  readonly undoMessage: string | React.ReactNode;
  readonly undoFailureMessage: string | React.ReactNode;
}

export type UndoableActionFn = Func<UndoableActionArgs, AsyncResult<UndoableAction | null>>;
