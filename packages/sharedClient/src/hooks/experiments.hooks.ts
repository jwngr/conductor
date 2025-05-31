import {useMemo} from 'react';

import {ALL_EXPERIMENT_DEFINITIONS} from '@shared/lib/experimentDefinitions.shared';

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
  const getBooleanAccountExperiment = useExperimentsStore(
    (state) => state.getBooleanAccountExperiment
  );

  const experimentDefinition = ALL_EXPERIMENT_DEFINITIONS[experimentId];

  if (experimentDefinition.experimentType !== ExperimentType.Boolean) {
    // This should be considered a critical error.
    // eslint-disable-next-line no-restricted-syntax
    throw new Error(`Experiment ${experimentId} is not a boolean experiment`);
  }

  const memoedAccounExperiment = useMemo(
    () => getBooleanAccountExperiment(experimentId),
    [getBooleanAccountExperiment, experimentId]
  );

  return memoedAccounExperiment;
}

export function useStringAccountExperiment(
  experimentId: ExperimentId
): StringAccountExperiment | null {
  const getStringAccountExperiment = useExperimentsStore(
    (state) => state.getStringAccountExperiment
  );

  const experimentDefinition = ALL_EXPERIMENT_DEFINITIONS[experimentId];

  if (experimentDefinition.experimentType !== ExperimentType.String) {
    // This should be considered a critical error.
    // eslint-disable-next-line no-restricted-syntax
    throw new Error(`Experiment ${experimentId} is not a string experiment`);
  }

  const memoedAccounExperiment = useMemo(
    () => getStringAccountExperiment(experimentId),
    [getStringAccountExperiment, experimentId]
  );

  return memoedAccounExperiment;
}
