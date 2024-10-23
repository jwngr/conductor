import {User} from 'firebase/auth';
import {create} from 'zustand';

import {Func} from '@shared/types/utils';

interface UserStoreState {
  loggedInUser: User | null;
  hasFetchedLoggedInUser: boolean;
  setLoggedInUser: Func<User | null>;
}

export const useUserStore = create<UserStoreState>((set) => ({
  // Initial state.
  loggedInUser: null,
  hasFetchedLoggedInUser: false,

  // Actions.
  setLoggedInUser: (loggedInUser) =>
    set({
      loggedInUser,
      hasFetchedLoggedInUser: true,
    }),
}));
