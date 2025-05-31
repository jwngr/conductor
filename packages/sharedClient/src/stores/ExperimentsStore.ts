import {create} from 'zustand';

import {ALL_EXPERIMENT_DEFINITIONS} from '@shared/lib/experimentDefinitions.shared';
import {
  makeBooleanAccountExperiment,
  makeStringAccountExperiment,
} from '@shared/lib/experiments.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {
  ExperimentType,
  type AccountExperiment,
  type BooleanAccountExperiment,
  type ExperimentId,
  type StringAccountExperiment,
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
  readonly getBooleanAccountExperiment: Func<ExperimentId, BooleanAccountExperiment | null>;
  readonly getStringAccountExperiment: Func<ExperimentId, StringAccountExperiment | null>;
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
  getBooleanAccountExperiment: (experimentId): BooleanAccountExperiment | null => {
    const experiments = get().experiments;
    if (!experiments) {
      return null;
    }

    const experimentDefinition = ALL_EXPERIMENT_DEFINITIONS[experimentId];

    if (experimentDefinition.experimentType !== ExperimentType.Boolean) {
      // This should be considered a critical error.
      // eslint-disable-next-line no-restricted-syntax
      throw new Error(
        `Experiment definition for ${experimentId} has incorrect type: expected ` +
          `${ExperimentType.Boolean}, got ${experimentDefinition.experimentType}`
      );
    }

    const experiment = experiments.find((state) => state.definition.experimentId === experimentId);

    if (!experiment) {
      // If the experiment is not actually visible to this user on this environment, fall back to
      // it being disabled.
      return makeBooleanAccountExperiment({
        definition: experimentDefinition,
        isEnabled: false,
      });
    }

    switch (experiment.experimentType) {
      case ExperimentType.Boolean:
        return experiment;
      case ExperimentType.String:
        // This should be considered a critical error.
        // eslint-disable-next-line no-restricted-syntax
        throw new Error(
          `Experiment state for ${experimentId} has incorrect type: expected ` +
            `${ExperimentType.Boolean}, got ${experiment.experimentType}`
        );
      default:
        assertNever(experiment);
    }
  },
  getStringAccountExperiment: (experimentId): StringAccountExperiment | null => {
    const experiments = get().experiments;
    if (!experiments) {
      return null;
    }

    const experimentDefinition = ALL_EXPERIMENT_DEFINITIONS[experimentId];

    if (experimentDefinition.experimentType !== ExperimentType.String) {
      // This should be considered a critical error.
      // eslint-disable-next-line no-restricted-syntax
      throw new Error(
        `Experiment definition for ${experimentId} has incorrect type: expected ` +
          `${ExperimentType.String}, got ${experimentDefinition.experimentType}`
      );
    }

    const experiment = experiments.find((state) => state.definition.experimentId === experimentId);

    if (!experiment) {
      // If the experiment is not actually visible to this user on this environment, fall back to
      // it being disabled with an empty value.
      return makeStringAccountExperiment({
        definition: experimentDefinition,
        isEnabled: false,
        value: '',
      });
    }

    switch (experiment.experimentType) {
      case ExperimentType.String:
        return experiment;
      case ExperimentType.Boolean:
        // This should be considered a critical error.
        // eslint-disable-next-line no-restricted-syntax
        throw new Error(
          `Experiment state for ${experimentId} has incorrect type: expected ` +
            `${ExperimentType.String}, got ${experiment.experimentType}`
        );
      default:
        assertNever(experiment);
    }
  },
}));
