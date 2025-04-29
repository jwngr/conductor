import {create} from 'zustand';

import type {AsyncResult} from '@shared/types/results.types';

// import type {Task} from '@shared/types/utils.types'; // Removed unused import

export type UndoAction = () => Promise<AsyncResult<void>>;

const MAX_UNDO_STACK_SIZE = 10;

interface UndoStoreState {
  readonly undoStack: readonly UndoAction[];
  readonly pushUndoAction: (action: UndoAction) => void;
  readonly executeAndPopUndoAction: () => Promise<void>;
  readonly clearUndoStack: () => void;
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
    if (currentStack.length > 0) {
      const [actionToExecute, ...remainingStack] = currentStack;
      set({undoStack: remainingStack});
      await actionToExecute();
    }
  },

  clearUndoStack: () => set({undoStack: []}),
}));

// Optional: Define a specific type for the result of actions that can be undone.
export interface UndoableActionResult {
  undo: UndoAction;
}
