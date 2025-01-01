import {logger} from '@shared/services/logger.shared';

import {prefixError, upgradeUnknownError} from '@shared/lib/errorUtils.shared';

/**
 * Global error handler for the PWA application.
 */
export function handleError(error: unknown): void {
  logger.error(prefixError(upgradeUnknownError(error), 'Error caught by global error handler'));
  // TODO: Show an error page. We cannot guarantee React was even initialized, and it probably was
  // not since this error wasn't caught by `ErrorBoundary`.
}

/**
 * Sets up global error handlers for the PWA application.
 */
export function setupGlobalErrorHandlers(): void {
  // Handle uncaught errors.
  window.addEventListener('error', (event) => {
    event.preventDefault();
    handleError(event.error);
  });

  // Handle unhandled promise rejections.
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    handleError(event.reason);
  });
}
