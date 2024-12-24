import {logger} from '@shared/services/logger.shared';

import type {LoggedInUser} from '@shared/types/user.types';

import {useAuthStore} from '@sharedClient/stores/AuthStore';

export function useMaybeLoggedInUser(): {
  readonly isLoading: boolean;
  readonly loggedInUser: LoggedInUser | null;
} {
  const isLoading = useAuthStore((state) => state.isLoading);
  const loggedInUser = useAuthStore((state) => state.loggedInUser);
  return {isLoading, loggedInUser};
}

export function useLoggedInUser(): LoggedInUser {
  const loggedInUser = useAuthStore((state) => state.loggedInUser);
  if (!loggedInUser) {
    const errorMessage =
      'No logged-in user exists. `useLoggedInUser` can only be called when there is a logged-in user. Either use `useMaybeLoggedInUser` or fix the bug.';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
  return loggedInUser;
}
