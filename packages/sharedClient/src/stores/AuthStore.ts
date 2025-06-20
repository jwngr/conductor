import {create} from 'zustand';

import type {Consumer} from '@shared/types/utils.types';

import type {LoggedInAccount} from '@sharedClient/types/accounts.client.types';

interface AuthStoreState {
  readonly loggedInAccount: LoggedInAccount | null;
  readonly isLoading: boolean;
  readonly setLoggedInAccount: Consumer<LoggedInAccount | null>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  // Initial state.
  loggedInAccount: null,
  isLoading: true,

  // Actions.
  setLoggedInAccount: (loggedInAccount) => set({loggedInAccount, isLoading: false}),
}));
