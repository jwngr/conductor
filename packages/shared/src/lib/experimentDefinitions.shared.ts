import {ALL_ENVIRONMENTS} from '@shared/lib/environment.shared';
import {makeBooleanExperimentDefinition} from '@shared/lib/experiments.shared';

import type {ExperimentDefinition} from '@shared/types/experiments.types';
import {ExperimentId, ExperimentVisibility} from '@shared/types/experiments.types';

export const DEBUG_EXPERIMENT = makeBooleanExperimentDefinition({
  experimentId: ExperimentId.Debug,
  environments: ALL_ENVIRONMENTS,
  title: 'Debug',
  description: 'Enables debug UI',
  visibility: ExperimentVisibility.Internal,
  defaultValue: true,
});

export const ALL_EXPERIMENT_DEFINITIONS: Record<ExperimentId, ExperimentDefinition> = {
  [ExperimentId.Debug]: DEBUG_EXPERIMENT,
};

export const ORDERED_EXPERIMENT_IDS = [ExperimentId.Debug];
