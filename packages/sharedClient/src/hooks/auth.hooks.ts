import {logger} from '@shared/services/logger.shared';

import type {Account} from '@shared/types/accounts.types';

import {useAuthStore} from '@sharedClient/stores/AuthStore';

export function useMaybeLoggedInAccount(): {
  readonly isLoading: boolean;
  readonly loggedInAccount: Account | null;
} {
  const isLoading = useAuthStore((state) => state.isLoading);
  const loggedInAccount = useAuthStore((state) => state.loggedInAccount);
  return {isLoading, loggedInAccount};
}

export function useLoggedInAccount(): Account {
  const loggedInAccount = useAuthStore((state) => state.loggedInAccount);
  if (!loggedInAccount) {
    const error = new Error(
      'No logged-in account exists. `useLoggedInAccount` can only be called when there is a logged-in account. Either use `useMaybeLoggedInAccount` or fix the bug.'
    );
    logger.error(error);
    // eslint-disable-next-line no-restricted-syntax
    throw error;
  }
  return loggedInAccount;
}
