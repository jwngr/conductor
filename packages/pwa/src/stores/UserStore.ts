import {create} from 'zustand';

import {LoggedInUser} from '@shared/types/user';
import {Consumer} from '@shared/types/utils';

interface UserStoreState {
  readonly loggedInUser: LoggedInUser | null;
  readonly isLoading: boolean;
  readonly setLoggedInUser: Consumer<LoggedInUser | null>;
}

export const useUserStore = create<UserStoreState>((set) => ({
  // Initial state.
  loggedInUser: null,
  isLoading: true,

  // Actions.
  setLoggedInUser: (loggedInUser) => set({loggedInUser, isLoading: false}),
}));
