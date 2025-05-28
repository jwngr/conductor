import {create} from 'zustand';

import type {ExperimentId, ExperimentState} from '@shared/types/experiments.types';
import type {Consumer, Func} from '@shared/types/utils.types';

interface ExperimentsStoreState {
  // State.
  readonly experimentStates: readonly ExperimentState[];

  // Actions.
  readonly setExperimentStates: Consumer<readonly ExperimentState[]>;

  // Getters.
  readonly getExperimentState: Func<ExperimentId, ExperimentState | undefined>;
}

export const useExperimentsStore = create<ExperimentsStoreState>((set, get) => ({
  // Initial state.
  experimentStates: [],

  // Actions.
  setExperimentStates: (experimentStates) => set({experimentStates}),

  // Getters.
  getExperimentState: (experimentId): ExperimentState | undefined => {
    return get().experimentStates.find((state) => state.definition.experimentId === experimentId);
  },
}));
