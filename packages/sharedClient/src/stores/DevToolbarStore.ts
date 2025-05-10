import {create, type StateCreator} from 'zustand';

import {type DevToolbarStore} from '@shared/types/devToolbar.types';

const createDevToolbarStore: StateCreator<DevToolbarStore> = (set) => ({
  // Initial state.
  sections: [],
  showRouterDevTools: false,

  registerSection: (section) => {
    set((state) => ({
      ...state,
      sections: [...state.sections, section],
    }));

    return () =>
      set((state) => ({
        ...state,
        sections: state.sections.filter((s) => s.sectionType !== section.sectionType),
      }));
  },

  toggleRouterDevTools: () => {
    set((state) => ({
      ...state,
      showRouterDevTools: !state.showRouterDevTools,
    }));
  },
});

export const useDevToolbarStore = create<DevToolbarStore>(createDevToolbarStore);
