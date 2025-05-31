import {ALL_ENVIRONMENTS} from '@shared/lib/environment.shared';
import {
  makeBooleanExperimentDefinition,
  makeStringExperimentDefinition,
} from '@shared/lib/experiments.shared';

import type {ExperimentDefinition} from '@shared/types/experiments.types';
import {ExperimentId, ExperimentVisibility} from '@shared/types/experiments.types';

const INTERNAL_EXPERIMENT_1 = makeBooleanExperimentDefinition({
  experimentId: ExperimentId.Internal1,
  environments: ALL_ENVIRONMENTS,
  title: 'Internal #1',
  description:
    'This is the first experiment and it has a very long description that is used to test the UI. It needs to be long enough to wrap around to the next line.',
  visibility: ExperimentVisibility.Internal,
  defaultValue: false,
});

const INTERNAL_EXPERIMENT_2 = makeStringExperimentDefinition({
  experimentId: ExperimentId.Internal2,
  environments: ALL_ENVIRONMENTS,
  title: 'Internal #2',
  description: 'This is the second internal experiment.',
  visibility: ExperimentVisibility.Internal,
  defaultValue: '',
});

const PUBLIC_EXPERIMENT_1 = makeBooleanExperimentDefinition({
  experimentId: ExperimentId.Public1,
  environments: ALL_ENVIRONMENTS,
  title: 'Public #1',
  description: 'This is the first public experiment.',
  visibility: ExperimentVisibility.Public,
  defaultValue: false,
});

const PUBLIC_EXPERIMENT_2 = makeStringExperimentDefinition({
  experimentId: ExperimentId.Public2,
  environments: ALL_ENVIRONMENTS,
  title: 'Public #2',
  description: 'This is the second public experiment.',
  visibility: ExperimentVisibility.Public,
  defaultValue: 'this is the default',
});

export const ALL_EXPERIMENT_DEFINITIONS: Record<ExperimentId, ExperimentDefinition> = {
  [ExperimentId.Internal1]: INTERNAL_EXPERIMENT_1,
  [ExperimentId.Internal2]: INTERNAL_EXPERIMENT_2,
  [ExperimentId.Public1]: PUBLIC_EXPERIMENT_1,
  [ExperimentId.Public2]: PUBLIC_EXPERIMENT_2,
};

export const ORDERED_EXPERIMENT_IDS = [
  ExperimentId.Public1,
  ExperimentId.Public2,
  ExperimentId.Internal1,
  ExperimentId.Internal2,
];
