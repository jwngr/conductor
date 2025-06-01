import {toast as sonnerToast} from 'sonner';
import type {ExternalToast} from 'sonner';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {Supplier} from '@shared/types/utils.types';

export const toast = sonnerToast as typeof sonnerToast;

const DEFAULT_UNDO_TIMEOUT_MS = 5_000;

export function toastWithUndo(args: {
  readonly message: string | React.ReactNode;
  readonly undoAction: Supplier<AsyncResult<void>>;
  readonly undoMessage: string | React.ReactNode;
  readonly undoFailureMessage: string | React.ReactNode;
  readonly options?: ExternalToast;
}): void {
  const {message, undoAction, undoMessage, undoFailureMessage, options} = args;

  sonnerToast(message, {
    ...options,
    duration: options?.duration ?? DEFAULT_UNDO_TIMEOUT_MS,
    action: {
      label: 'Undo',
      onClick: async () => {
        const undoResult = await undoAction();

        if (!undoResult.success) {
          // Undo action itself failed.
          sonnerToast.error(undoFailureMessage, {
            description: undoResult.error.message,
          });
          logger.error(prefixError(undoResult.error, 'Failed to undo from toast'), {
            message,
            undoMessage,
            undoFailureMessage,
          });
          return;
        }

        // Undo action succeeded.
        sonnerToast.success(undoMessage);
      },
    },
  });
}
