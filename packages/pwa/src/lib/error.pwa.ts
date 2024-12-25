import type {NavigateOptions} from 'react-router-dom';

import {Urls} from '@shared/lib/urls.shared';

export interface ErrorNavigationState {
  readonly error: Error;
}

export interface NavigateToErrorPageOptions extends Omit<NavigateOptions, 'state'> {
  readonly replace?: boolean;
}

/**
 * Navigates to the error page with the provided error.
 * The error is passed via React Router's state to avoid storing it in the global state.
 */
export function navigateToErrorPage(
  error: Error,
  navigate: (to: string, options?: NavigateOptions) => void,
  options: NavigateToErrorPageOptions = {}
): void {
  const {replace = false, ...restOptions} = options;

  console.log('Navigating to error page:', {
    error,
    replace,
    restOptions,
  });

  navigate(Urls.forError(), {
    replace,
    state: {error} satisfies ErrorNavigationState,
    ...restOptions,
  });
}
