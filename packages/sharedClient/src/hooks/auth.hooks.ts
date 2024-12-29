import {logger} from '@shared/services/logger.shared';

import type {User} from '@shared/types/user.types';

import {useAuthStore} from '@sharedClient/stores/AuthStore';

export function useMaybeLoggedInUser(): {
  readonly isLoading: boolean;
  readonly loggedInUser: User | null;
} {
  const isLoading = useAuthStore((state) => state.isLoading);
  const loggedInUser = useAuthStore((state) => state.loggedInUser);
  return {isLoading, loggedInUser};
}

export function useLoggedInUser(): User {
  const loggedInUser = useAuthStore((state) => state.loggedInUser);
  if (!loggedInUser) {
    const error = new Error(
      'No logged-in user exists. `useLoggedInUser` can only be called when there is a logged-in user. Either use `useMaybeLoggedInUser` or fix the bug.'
    );
    logger.error(error);
    // eslint-disable-next-line no-restricted-syntax
    throw error;
  }
  return loggedInUser;
}
