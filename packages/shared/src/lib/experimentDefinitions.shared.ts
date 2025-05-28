import {ALL_ENVIRONMENTS} from '@shared/lib/environment.shared';
import {makeBooleanExperimentDefinition} from '@shared/lib/experiments.shared';

import type {ExperimentDefinition} from '@shared/types/experiments.types';
import {ExperimentId, ExperimentVisibility} from '@shared/types/experiments.types';

const INTERNAL_EXPERIMENT_1 = makeBooleanExperimentDefinition({
  experimentId: ExperimentId.Internal1,
  environments: ALL_ENVIRONMENTS,
  title: 'Internal #1',
  description:
    'This is the first experiment and it has a very long description that is used to test the UI. It needs to be long enough to wrap around to the next line.',
  visibility: ExperimentVisibility.Internal,
  defaultValue: true,
});

const INTERNAL_EXPERIMENT_2 = makeBooleanExperimentDefinition({
  experimentId: ExperimentId.Internal2,
  environments: ALL_ENVIRONMENTS,
  title: 'Internal #2',
  description: 'This is the second internal experiment.',
  visibility: ExperimentVisibility.Internal,
  defaultValue: true,
});

const PUBLIC_EXPERIMENT_1 = makeBooleanExperimentDefinition({
  experimentId: ExperimentId.Public1,
  environments: ALL_ENVIRONMENTS,
  title: 'Public #1',
  description: 'This is the first public experiment.',
  visibility: ExperimentVisibility.Public,
  defaultValue: true,
});

const PUBLIC_EXPERIMENT_2 = makeBooleanExperimentDefinition({
  experimentId: ExperimentId.Public2,
  environments: ALL_ENVIRONMENTS,
  title: 'Public #2',
  description: 'This is the second public experiment.',
  visibility: ExperimentVisibility.Public,
  defaultValue: true,
});

export const ALL_EXPERIMENT_DEFINITIONS: ExperimentDefinition[] = [
  INTERNAL_EXPERIMENT_1,
  INTERNAL_EXPERIMENT_2,
  PUBLIC_EXPERIMENT_1,
  PUBLIC_EXPERIMENT_2,
];
