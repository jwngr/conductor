import {
  ALL_EXPERIMENT_DEFINITIONS,
  ORDERED_EXPERIMENT_IDS,
} from '@shared/lib/experimentDefinitions.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {Environment} from '@shared/types/environment.types';
import type {
  AccountExperiment,
  AccountExperimentOverrides,
  AccountExperimentsState,
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

//////////////////////////////
//  EXPERIMENT DEFINITIONS  //
//////////////////////////////
export function makeBooleanExperimentDefinition(
  args: Omit<BooleanExperimentDefinition, 'experimentType'>
): BooleanExperimentDefinition {
  const {experimentId, environments, title, description, visibility, defaultIsEnabled} = args;
  return {
    experimentId,
    experimentType: ExperimentType.Boolean,
    environments,
    title,
    description,
    visibility,
    defaultIsEnabled,
  };
}

export function makeStringExperimentDefinition(
  args: Omit<StringExperimentDefinition, 'experimentType'>
): StringExperimentDefinition {
  const {experimentId, environments, title, description, visibility} = args;
  const {defaultIsEnabled, defaultValue} = args;
  return {
    experimentId,
    experimentType: ExperimentType.String,
    environments,
    title,
    description,
    visibility,
    defaultIsEnabled,
    defaultValue,
  };
}

///////////////////////////
//  ACCOUNT EXPERIMENTS  //
///////////////////////////
export function makeBooleanAccountExperiment(args: {
  readonly definition: BooleanExperimentDefinition;
  readonly isEnabled: boolean;
}): BooleanAccountExperiment {
  const {definition, isEnabled} = args;
  return {
    experimentType: ExperimentType.Boolean,
    definition,
    isEnabled,
  };
}

export function makeStringAccountExperiment(args: {
  readonly definition: StringExperimentDefinition;
  readonly isEnabled: boolean;
  readonly value: string;
}): StringAccountExperiment {
  const {definition, isEnabled, value} = args;
  return {
    experimentType: ExperimentType.String,
    definition,
    isEnabled,
    value,
  };
}

////////////////////////////
//  EXPERIMENT OVERRIDES  //
////////////////////////////
export function makeBooleanExperimentOverride(args: {
  readonly experimentId: ExperimentId;
  readonly isEnabled: boolean;
}): BooleanExperimentOverride {
  const {experimentId, isEnabled} = args;
  return {
    experimentId,
    experimentType: ExperimentType.Boolean,
    isEnabled,
  };
}

export function makeStringExperimentOverride(args: {
  readonly experimentId: ExperimentId;
  readonly isEnabled: boolean;
  readonly value: string;
}): StringExperimentOverride {
  const {experimentId, isEnabled, value} = args;
  return {
    experimentId,
    experimentType: ExperimentType.String,
    isEnabled,
    value,
  };
}

/////////////////////////////////
//  ACCOUNT EXPERIMENTS STATE  //
/////////////////////////////////
export function makeDefaultAccountExperimentsState(args: {
  readonly accountId: AccountId;
  readonly isInternalAccount: boolean;
}): AccountExperimentsState {
  const {accountId, isInternalAccount} = args;

  const accountVisibility = isInternalAccount
    ? ExperimentVisibility.Internal
    : ExperimentVisibility.Public;

  return {
    accountId,
    accountVisibility,
    experimentOverrides: {},
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };
}

/////////////////////
//  OTHER HELPERS  //
/////////////////////
/**
 * Returns whether or not an experiment is enabled for a given environment.
 */
function isExperimentEnabledForEnvironment(args: {
  readonly experiment: ExperimentDefinition;
  readonly environment: Environment;
}): boolean {
  const {experiment, environment} = args;
  return experiment.environments.includes(environment);
}

/**
 * Returns whether or not an account with the provided visibility can view the provided experiment.
 */
function isExperimentVisible(args: {
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

  // Merge account overrides into default values.
  return filteredExperimentIds.map((experimentId) => {
    const definition = ALL_EXPERIMENT_DEFINITIONS[experimentId];
    const override = experimentOverrides[definition.experimentId];

    switch (definition.experimentType) {
      case ExperimentType.Boolean:
        return makeBooleanAccountExperiment({
          definition,
          isEnabled: override ? override.isEnabled : definition.defaultIsEnabled,
        });
      case ExperimentType.String:
        return makeStringAccountExperiment({
          definition,
          isEnabled: override ? override.isEnabled : definition.defaultIsEnabled,
          value:
            override && override.experimentType === ExperimentType.String
              ? override.value
              : definition.defaultValue,
        });
      default:
        assertNever(definition);
    }
  });
}

export function isBooleanExperimentEnabled(
  accountExperiment: BooleanAccountExperiment | null
): boolean {
  if (!accountExperiment) {
    // Assume boolean experiments are disabled by default.
    return false;
  }

  return accountExperiment.isEnabled;
}
