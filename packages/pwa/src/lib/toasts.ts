import {toast as sonnerToast} from 'sonner';
import type {ExternalToast} from 'sonner';

import type {UndoAction} from '@shared/types/undo.types';

export const toast = sonnerToast as typeof sonnerToast & {successWithUndo: typeof successWithUndo};

const DEFAULT_UNDO_TIMEOUT_MS = 5_000;

/**
 * Shows a success toast with an Undo button.
 */
function successWithUndo(
  message: string | React.ReactNode,
  onUndo: UndoAction,
  options?: ExternalToast
): void {
  sonnerToast.success(message, {
    ...options,
    duration: options?.duration ?? DEFAULT_UNDO_TIMEOUT_MS,
    action: {
      label: 'Undo',
      onClick: async () => await onUndo(),
    },
  });
}

// Add the new function to the exported object
toast.successWithUndo = successWithUndo;
