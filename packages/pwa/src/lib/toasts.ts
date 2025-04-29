import {toast as sonnerToast} from 'sonner';
import type {ExternalToast} from 'sonner';

import type {UndoAction} from '@sharedClient/stores/UndoStore';

// Keep the original export for direct use if needed
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
        // Optionally add loading state to the button here if needed
        await onUndo();
        // No need to manually dismiss, Sonner handles it on action click by default
      },
    },
    // We can also clear the global undo action if the toast times out or is dismissed manually
    // onDismiss: () => {
    //   console.log('Toast dismissed');
    //   // Potentially clear the global undo action here if it matches? Might be tricky.
    // },
    // onAutoClose: () => {
    //   console.log('Toast auto-closed');
    //   // Potentially clear the global undo action here if it matches? Might be tricky.
    // },
  });
}

// Add the new function to the exported object
toast.successWithUndo = successWithUndo;
