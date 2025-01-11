import {create} from 'zustand';

import type {User} from '@shared/types/user.types';
import type {Consumer} from '@shared/types/utils.types';

interface AuthStoreState {
  readonly loggedInUser: User | null;
  readonly isLoading: boolean;
  readonly setLoggedInUser: Consumer<User | null>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  // Initial state.
  loggedInUser: null,
  isLoading: true,

  // Actions.
  setLoggedInUser: (loggedInUser) => set({loggedInUser, isLoading: false}),
}));
