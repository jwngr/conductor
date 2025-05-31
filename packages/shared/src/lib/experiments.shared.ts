import {
  ALL_EXPERIMENT_DEFINITIONS,
  ORDERED_EXPERIMENT_IDS,
} from '@shared/lib/experimentDefinitions.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {Environment} from '@shared/types/environment.types';
import type {
  AccountExperiment,
  AccountExperimentOverrides,
  BooleanAccountExperiment,
  BooleanExperimentDefinition,
  BooleanExperimentOverride,
  ExperimentDefinition,
  ExperimentId,
  StringAccountExperiment,
  StringExperimentDefinition,
  StringExperimentOverride,
} from '@shared/types/experiments.types';
import {ExperimentType, ExperimentVisibility} from '@shared/types/experiments.types';

export function makeBooleanExperimentDefinition(
  args: Omit<BooleanExperimentDefinition, 'experimentType'>
): BooleanExperimentDefinition {
  const {experimentId, environments, title, description, visibility, defaultValue} = args;
  return {
    experimentId,
    experimentType: ExperimentType.Boolean,
    environments,
    title,
    description,
    visibility,
    defaultValue,
  };
}

export function makeStringExperimentDefinition(
  args: Omit<StringExperimentDefinition, 'experimentType'>
): StringExperimentDefinition {
  const {experimentId, environments, title, description, visibility, defaultValue} = args;
  return {
    experimentId,
    experimentType: ExperimentType.String,
    environments,
    title,
    description,
    visibility,
    defaultValue,
  };
}

export function makeBooleanAccountExperiment(args: {
  readonly definition: BooleanExperimentDefinition;
  readonly value: boolean | undefined;
}): BooleanAccountExperiment {
  const {definition, value} = args;
  return {
    definition,
    value: typeof value === 'undefined' ? definition.defaultValue : value,
  };
}

export function makeStringAccountExperiment(args: {
  readonly definition: StringExperimentDefinition;
  readonly value: string | undefined;
}): StringAccountExperiment {
  const {definition, value} = args;
  return {
    definition,
    value: typeof value === 'undefined' ? definition.defaultValue : value,
  };
}

export function makeAccountExperimentWithDefaultValue(args: {
  readonly experimentDefinition: ExperimentDefinition;
}): AccountExperiment {
  const {experimentDefinition} = args;
  switch (experimentDefinition.experimentType) {
    case ExperimentType.Boolean:
      return makeBooleanAccountExperiment({
        definition: experimentDefinition,
        value: experimentDefinition.defaultValue,
      });
    case ExperimentType.String:
      return makeStringAccountExperiment({
        definition: experimentDefinition,
        value: experimentDefinition.defaultValue,
      });
    default:
      assertNever(experimentDefinition);
  }
}

export function makeBooleanExperimentOverride(args: {
  readonly experimentId: ExperimentId;
  readonly value: boolean;
}): BooleanExperimentOverride {
  const {experimentId, value} = args;
  return {
    experimentId,
    experimentType: ExperimentType.Boolean,
    value,
  };
}

export function makeStringExperimentOverride(args: {
  readonly experimentId: ExperimentId;
  readonly value: string;
}): StringExperimentOverride {
  const {experimentId, value} = args;
  return {
    experimentId,
    experimentType: ExperimentType.String,
    value,
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
  readonly experiments: Record<ExperimentId, ExperimentDefinition>;
  readonly orderedExperimentIds: readonly ExperimentId[];
  readonly accountVisibility: ExperimentVisibility;
  readonly environment: Environment;
}): readonly ExperimentId[] {
  const {experiments, orderedExperimentIds, accountVisibility, environment} = args;
  return orderedExperimentIds.filter((experimentId) => {
    const experiment = experiments[experimentId];
    return (
      isExperimentVisible({experiment, accountVisibility}) &&
      isExperimentEnabledForEnvironment({experiment, environment})
    );
  });
}

export function getExperimentsForAccount(args: {
  readonly environment: Environment;
  readonly accountVisibility: ExperimentVisibility;
  readonly accountOverrides: AccountExperimentOverrides;
}): readonly AccountExperiment[] {
  const {accountVisibility, environment, accountOverrides: experimentOverrides} = args;

  // Filter by visibility and environment.
  const filteredExperimentIds = filterExperimentsByVisibilityAndEnvironment({
    experiments: ALL_EXPERIMENT_DEFINITIONS,
    orderedExperimentIds: ORDERED_EXPERIMENT_IDS,
    accountVisibility,
    environment,
  });

  // Merge user overrides into default values.
  return filteredExperimentIds.map((experimentId) => {
    const definition = ALL_EXPERIMENT_DEFINITIONS[experimentId];
    const override = experimentOverrides[definition.experimentId];

    switch (definition.experimentType) {
      case ExperimentType.Boolean:
        return makeBooleanAccountExperiment({
          definition,
          value: typeof override?.value === 'boolean' ? override.value : undefined,
        });
      case ExperimentType.String:
        return makeStringAccountExperiment({
          definition,
          value: typeof override?.value === 'string' ? override.value : undefined,
        });
      default:
        assertNever(definition);
    }
  });
}
