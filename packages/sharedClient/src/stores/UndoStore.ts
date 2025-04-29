import {create} from 'zustand';

import {logger} from '@shared/services/logger.shared';

import {makeErrorResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {Consumer, Supplier} from '@shared/types/utils.types';

const MAX_UNDO_STACK_SIZE = 25;

export type UndoAction = Supplier<AsyncResult<void>>;

export interface UndoableActionResult {
  readonly undo: UndoAction;
}

interface UndoStoreState {
  readonly undoStack: readonly UndoAction[];
  readonly pushUndoAction: Consumer<UndoAction>;
  readonly executeAndPopUndoAction: Supplier<AsyncResult<void>>;
}

export const useUndoStore = create<UndoStoreState>((set, get) => ({
  undoStack: [],

  pushUndoAction: (action) =>
    set((state) => {
      const newStack = [action, ...state.undoStack].slice(0, MAX_UNDO_STACK_SIZE);
      return {undoStack: newStack};
    }),

  executeAndPopUndoAction: async () => {
    const currentStack = get().undoStack;
    if (currentStack.length === 0) {
      const error = new Error('No undo action to execute');
      logger.error(error);
      return makeErrorResult(error);
    }

    const [actionToExecute, ...remainingStack] = currentStack;
    set({undoStack: remainingStack});
    return await actionToExecute();
  },
}));
