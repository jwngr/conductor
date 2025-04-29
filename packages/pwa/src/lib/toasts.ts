import {toast as sonnerToast} from 'sonner';
import type {ExternalToast} from 'sonner';

import type {UndoAction} from '@sharedClient/stores/UndoStore';

export const toast = sonnerToast as typeof sonnerToast & {successWithUndo: typeof successWithUndo};

const UNDO_TIMEOUT_MS = 5000; // 5 seconds for undo

/**
 * Shows a success toast with an Undo button.
 *
 * @param message The main message for the toast.
 * @param onUndo The function to execute when Undo is clicked.
 * @param options Optional Sonner toast options.
 */
function successWithUndo(
  message: string | React.ReactNode,
  onUndo: UndoAction,
  options?: ExternalToast
): void {
  sonnerToast.success(message, {
    ...options,
    duration: options?.duration ?? UNDO_TIMEOUT_MS, // Use provided duration or default
    action: {
      label: 'Undo',
      onClick: async () => {
        await onUndo();
      },
    },
  });
}

// Add the new function to the exported object
toast.successWithUndo = successWithUndo;
