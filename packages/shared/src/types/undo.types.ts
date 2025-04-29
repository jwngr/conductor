import type {AsyncResult} from '@shared/types/results.types';
import type {Func, Supplier} from '@shared/types/utils.types';

export type UndoAction = Supplier<AsyncResult<void>>;

export type UndoableActionFn = Func<{isActive: boolean}, AsyncResult<UndoAction>>;
