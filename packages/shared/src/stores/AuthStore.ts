import {create} from 'zustand';

import {LoggedInUser} from '@shared/types/user.types';
import {Consumer} from '@shared/types/utils.types';

interface AuthStoreState {
  readonly loggedInUser: LoggedInUser | null;
  readonly isLoading: boolean;
  readonly setLoggedInUser: Consumer<LoggedInUser | null>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  // Initial state.
  loggedInUser: null,
  isLoading: true,

  // Actions.
  setLoggedInUser: (loggedInUser) => set({loggedInUser, isLoading: false}),
}));
