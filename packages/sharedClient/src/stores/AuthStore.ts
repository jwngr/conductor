import {create} from 'zustand';

import type {Account} from '@shared/types/accounts.types';
import type {Consumer} from '@shared/types/utils.types';

interface AuthStoreState {
  // State.
  readonly loggedInAccount: Account | null;
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Actions.
  readonly setLoggedInAccount: Consumer<Account | null>;
  readonly setError: Consumer<Error>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  // Initial state.
  loggedInAccount: null,
  isLoading: true,
  error: null,

  // Actions.
  setLoggedInAccount: (loggedInAccount) => set({loggedInAccount, isLoading: false}),
  setError: (error) => set({loggedInAccount: null, isLoading: false, error}),
}));
