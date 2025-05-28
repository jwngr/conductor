import {assertNever} from '@shared/lib/utils.shared';

import type {Environment} from '@shared/types/environment.types';
import type {
  BooleanExperimentDefinition,
  EnumExperimentDefinition,
  ExperimentDefinition,
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

export function makeEnumExperimentDefinition(
  args: Omit<EnumExperimentDefinition, 'experimentType'>
): EnumExperimentDefinition {
  return {
    experimentId: args.experimentId,
    experimentType: ExperimentType.Enum,
    environments: args.environments,
    title: args.title,
    description: args.description,
    visibility: args.visibility,
    defaultValue: args.defaultValue,
    options: args.options,
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
  readonly viewerAccess: ExperimentVisibility;
}): boolean {
  const {experiment, viewerAccess} = args;
  switch (experiment.visibility) {
    case ExperimentVisibility.Public:
      // Public experiments are always visible.
      return true;
    case ExperimentVisibility.Internal: {
      // Internal experiments are visible if the account can view internal experiments.
      switch (viewerAccess) {
        case ExperimentVisibility.Public:
          return false;
        case ExperimentVisibility.Internal:
          return true;
        default:
          assertNever(viewerAccess);
      }
      break;
    }
    default:
      assertNever(experiment.visibility);
  }
}

export function filterExperimentsByVisibilityAndEnvironment(args: {
  readonly experiments: readonly ExperimentDefinition[];
  readonly viewerAccess: ExperimentVisibility;
  readonly environment: Environment;
}): readonly ExperimentDefinition[] {
  const {experiments, viewerAccess, environment} = args;
  return experiments.filter(
    (experiment) =>
      isExperimentVisible({experiment, viewerAccess}) &&
      isExperimentEnabledForEnvironment({experiment, environment})
  );
}
