import {create} from 'zustand';

import {LoggedInUser} from '@shared/types/user.types';
import {Consumer} from '@shared/types/utils.types';

interface AuthStoreState {
  readonly loggedInUser: LoggedInUser | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly setLoggedInUser: Consumer<LoggedInUser | null>;
  readonly setError: Consumer<Error>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  // Initial state.
  loggedInUser: null,
  isLoading: true,
  error: null,

  // Actions.
  setLoggedInUser: (loggedInUser) => set({loggedInUser, isLoading: false}),
  setError: (error) => set({loggedInUser: null, isLoading: false, error}),
}));
