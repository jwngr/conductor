import {create} from 'zustand';

import type {AccountExperiment, ExperimentId} from '@shared/types/experiments.types';
import type {Consumer, Func} from '@shared/types/utils.types';

interface ExperimentsStoreState {
  // State.
  readonly experiments: readonly AccountExperiment[];

  // Actions.
  readonly setExperiments: Consumer<readonly AccountExperiment[]>;

  // Getters.
  readonly getExperimentState: Func<ExperimentId, AccountExperiment | undefined>;
}

export const useExperimentsStore = create<ExperimentsStoreState>((set, get) => ({
  // Initial state.
  experiments: [],

  // Actions.
  setExperiments: (experimentStates) => set({experiments: experimentStates}),

  // Getters.
  getExperimentState: (experimentId): AccountExperiment | undefined => {
    return get().experiments.find((state) => state.definition.experimentId === experimentId);
  },
}));
