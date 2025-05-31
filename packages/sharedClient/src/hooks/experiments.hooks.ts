import {useMemo} from 'react';

import {ALL_EXPERIMENT_DEFINITIONS} from '@shared/lib/experimentDefinitions.shared';
import {
  makeBooleanAccountExperiment,
  makeStringAccountExperiment,
} from '@shared/lib/experiments.shared';

import type {
  BooleanAccountExperiment,
  ExperimentId,
  StringAccountExperiment,
} from '@shared/types/experiments.types';
import {ExperimentType} from '@shared/types/experiments.types';

import {useExperimentsStore} from '@sharedClient/stores/ExperimentsStore';

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

    return experiment as BooleanAccountExperiment;
  }, [experiments, experimentId, experimentDefinition]);

  return memoedAccounExperiment;
}

export function useStringAccountExperiment(
  experimentId: ExperimentId
): StringAccountExperiment | null {
  const experiments = useExperimentsStore((state) => state.experiments);

  const experimentDefinition = ALL_EXPERIMENT_DEFINITIONS[experimentId];

  if (experimentDefinition.experimentType !== ExperimentType.String) {
    // This should be considered a critical error.
    // eslint-disable-next-line no-restricted-syntax
    throw new Error(`Experiment ${experimentId} is not a string experiment`);
  }

  const memoedAccounExperiment = useMemo(() => {
    if (!experiments) {
      // Still loading which experience the account has for this experiment.
      return null;
    }

    const experiment = experiments?.find((exp) => exp.definition.experimentId === experimentId);
    if (!experiment) {
      // If the experiment is not actually visible to this user on this environment, fall back to
      // it being empty.
      return makeStringAccountExperiment({
        definition: experimentDefinition,
        value: '',
      });
    }

    return experiment as StringAccountExperiment;
  }, [experiments, experimentId, experimentDefinition]);

  return memoedAccounExperiment;
}
