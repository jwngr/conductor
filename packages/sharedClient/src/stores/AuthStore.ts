import {create} from 'zustand';

import type {Account} from '@shared/types/accounts.types';
import type {Consumer} from '@shared/types/utils.types';

interface AuthStoreState {
  readonly loggedInAccount: Account | null;
  readonly isLoading: boolean;
  readonly setLoggedInAccount: Consumer<Account | null>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  // Initial state.
  loggedInAccount: null,
  isLoading: true,

  // Actions.
  setLoggedInAccount: (loggedInAccount) => set({loggedInAccount, isLoading: false}),
}));
