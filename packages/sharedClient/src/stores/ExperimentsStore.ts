import {useMemo} from 'react';
import {create} from 'zustand';

import {ALL_EXPERIMENT_DEFINITIONS} from '@shared/lib/experimentDefinitions.shared';
import {
  makeAccountExperimentWithEmptyValue,
  makeBooleanAccountExperiment,
} from '@shared/lib/experiments.shared';

import {
  ExperimentType,
  type AccountExperiment,
  type BooleanAccountExperiment,
  type ExperimentId,
} from '@shared/types/experiments.types';
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

export function useAccountExperiment(experimentId: ExperimentId): AccountExperiment | null {
  const experiments = useExperimentsStore((state) => state.experiments);

  const experimentDefinition = ALL_EXPERIMENT_DEFINITIONS[experimentId];

  const memoedAccounExperiment = useMemo(() => {
    if (!experiments) {
      // Still loading which experience the account has for this experiment.
      return null;
    }

    const experiment = experiments?.find((exp) => exp.definition.experimentId === experimentId);
    if (!experiment) {
      // If the experiment is not actually visible to this user on this environment, fall back to an
      // empty experiment value.
      return makeAccountExperimentWithEmptyValue({experimentDefinition});
    }

    return experiment;
  }, [experiments, experimentId, experimentDefinition]);

  return memoedAccounExperiment;
}

export function useBooleanAccountExperiment(
  experimentId: ExperimentId
): BooleanAccountExperiment | null {
  const experiments = useExperimentsStore((state) => state.experiments);

  const experimentDefinition = ALL_EXPERIMENT_DEFINITIONS[experimentId];

  if (experimentDefinition.experimentType !== ExperimentType.Boolean) {
    // This should be considered a critical error.
    // eslint-disable-next-line no-restricted-syntax
    throw new Error(`Experiment ${experimentId} is not a boolean experiment`);
  }

  const memoedAccounExperiment = useMemo(() => {
    if (!experiments) {
      // Still loading which experience the account has for this experiment.
      return null;
    }

    const experiment = experiments?.find((exp) => exp.definition.experimentId === experimentId);
    if (!experiment) {
      // If the experiment is not actually visible to this user on this environment, fall back to
      // it being disabled.
      return makeBooleanAccountExperiment({
        definition: experimentDefinition,
        value: false,
      });
    }

    return experiment;
  }, [experiments, experimentId, experimentDefinition]);

  return memoedAccounExperiment;
}
