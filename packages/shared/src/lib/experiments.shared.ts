import {ALL_EXPERIMENT_DEFINITIONS} from '@shared/lib/experimentDefinitions.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {Environment} from '@shared/types/environment.types';
import type {
  AccountExperiment,
  AccountExperimentOverrides,
  BooleanAccountExperiment,
  BooleanExperimentDefinition,
  ExperimentDefinition,
  StringAccountExperiment,
  StringExperimentDefinition,
} from '@shared/types/experiments.types';
import {ExperimentType, ExperimentVisibility} from '@shared/types/experiments.types';

export function makeBooleanExperimentDefinition(
  args: Omit<BooleanExperimentDefinition, 'experimentType'>
): BooleanExperimentDefinition {
  return {
    experimentId: args.experimentId,
    experimentType: ExperimentType.Boolean,
    environments: args.environments,
    title: args.title,
    description: args.description,
    visibility: args.visibility,
    defaultValue: args.defaultValue,
  };
}

export function makeStringExperimentDefinition(
  args: Omit<StringExperimentDefinition, 'experimentType'>
): StringExperimentDefinition {
  return {
    experimentId: args.experimentId,
    experimentType: ExperimentType.String,
    environments: args.environments,
    title: args.title,
    description: args.description,
    visibility: args.visibility,
    defaultValue: args.defaultValue,
  };
}

export function makeBooleanExperimentState(args: {
  readonly definition: BooleanExperimentDefinition;
  readonly value: boolean | undefined;
}): BooleanAccountExperiment {
  return {
    definition: args.definition,
    value: typeof args.value === 'undefined' ? args.definition.defaultValue : args.value,
  };
}

export function makeStringExperimentState(args: {
  readonly definition: StringExperimentDefinition;
  readonly value: string | undefined;
}): StringAccountExperiment {
  return {
    definition: args.definition,
    value: typeof args.value === 'undefined' ? args.definition.defaultValue : args.value,
  };
}

/**
 * Returns whether or not an experiment is enabled for a given environment.
 */
export function isExperimentEnabledForEnvironment(args: {
  readonly experiment: ExperimentDefinition;
  readonly environment: Environment;
}): boolean {
  const {experiment, environment} = args;
  return experiment.environments.includes(environment);
}

/**
 * Returns whether or not an account with the provided visibility can view the provided experiment.
 */
export function isExperimentVisible(args: {
  readonly experiment: ExperimentDefinition;
  readonly accountVisibility: ExperimentVisibility;
}): boolean {
  const {experiment, accountVisibility} = args;
  switch (experiment.visibility) {
    case ExperimentVisibility.Public:
      // Public experiments are always visible.
      return true;
    case ExperimentVisibility.Internal: {
      // Internal experiments are visible if the account can view internal experiments.
      switch (accountVisibility) {
        case ExperimentVisibility.Public:
          return false;
        case ExperimentVisibility.Internal:
          return true;
        default:
          assertNever(accountVisibility);
      }
      break;
    }
    default:
      assertNever(experiment.visibility);
  }
}

function filterExperimentsByVisibilityAndEnvironment(args: {
  readonly experiments: readonly ExperimentDefinition[];
  readonly accountVisibility: ExperimentVisibility;
  readonly environment: Environment;
}): readonly ExperimentDefinition[] {
  const {experiments, accountVisibility, environment} = args;
  return experiments.filter(
    (experiment) =>
      isExperimentVisible({experiment, accountVisibility}) &&
      isExperimentEnabledForEnvironment({experiment, environment})
  );
}

export function getExperimentsForAccount(args: {
  readonly environment: Environment;
  readonly accountVisibility: ExperimentVisibility;
  readonly accountOverrides: AccountExperimentOverrides;
}): readonly AccountExperiment[] {
  const {accountVisibility, environment, accountOverrides: experimentOverrides} = args;

  // Filter by visibility and environment.
  const filteredExperimentDefinitions = filterExperimentsByVisibilityAndEnvironment({
    experiments: ALL_EXPERIMENT_DEFINITIONS,
    accountVisibility,
    environment,
  });

  // Merge user overrides into default values.
  return filteredExperimentDefinitions.map((definition) => {
    const override = experimentOverrides[definition.experimentId];

    switch (definition.experimentType) {
      case ExperimentType.Boolean:
        return makeBooleanExperimentState({
          definition,
          value: typeof override?.value === 'boolean' ? override.value : undefined,
        });
      case ExperimentType.String:
        return makeStringExperimentState({
          definition,
          value: typeof override?.value === 'string' ? override.value : undefined,
        });
      default:
        assertNever(definition);
    }
  });
}
