import {create} from 'zustand';

import type {AccountExperiment, ExperimentId} from '@shared/types/experiments.types';
import type {Consumer, Func} from '@shared/types/utils.types';

import type {ClientExperimentsService} from '@sharedClient/services/experiments.client';

interface ExperimentsStoreState {
  // State.
  readonly experiments: readonly AccountExperiment[] | null;
  readonly experimentsService: ClientExperimentsService | null;

  // Actions.
  readonly setExperiments: Consumer<readonly AccountExperiment[]>;
  readonly setExperimentsService: Consumer<ClientExperimentsService>;
  readonly resetExperimentsStore: Consumer<void>;

  // Getters.
  readonly getExperimentState: Func<ExperimentId, AccountExperiment | undefined>;
}

export const useExperimentsStore = create<ExperimentsStoreState>((set, get) => ({
  // Initial state.
  experiments: null,
  experimentsService: null,

  // Actions.
  setExperiments: (experiments) => set({experiments}),
  setExperimentsService: (experimentsService) => set({experimentsService}),
  resetExperimentsStore: () => set({experiments: null, experimentsService: null}),

  // Getters.
  getExperimentState: (experimentId): AccountExperiment | undefined => {
    return get().experiments?.find((state) => state.definition.experimentId === experimentId);
  },
}));
