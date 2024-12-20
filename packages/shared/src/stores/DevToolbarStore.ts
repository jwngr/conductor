import {create, type StateCreator} from 'zustand';

import {type DevToolbarStore} from '@shared/types/devToolbar.types';

const createDevToolbarStore: StateCreator<DevToolbarStore> = (set) => ({
  // Initial state.
  actions: [],

  registerAction: (action) => {
    set((state) => ({
      actions: [...state.actions, action],
    }));

    return () =>
      set((state) => ({
        ...state,
        actions: state.actions.filter((a) => a.actionId !== action.actionId),
      }));
  },
});

export const useDevToolbarStore = create<DevToolbarStore>(createDevToolbarStore);
