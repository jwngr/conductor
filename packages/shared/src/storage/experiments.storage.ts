import {ALL_EXPERIMENT_DEFINITIONS} from '@shared/lib/experimentDefinitions.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever, mapObjectValues} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import {ExperimentType} from '@shared/types/experiments.types';
import type {
  AccountExperimentsState,
  BooleanExperimentOverride,
  ExperimentDefinition,
  ExperimentOverride,
  StringExperimentOverride,
} from '@shared/types/experiments.types';
import type {Result} from '@shared/types/results.types';

import type {
  AccountExperimentsStateFromStorage,
  BooleanExperimentOverrideFromStorage,
  ExperimentDefinitionFromStorage,
  ExperimentOverrideFromStorage,
  StringExperimentOverrideFromStorage,
} from '@shared/schemas/experiments.schema';

/**
 * Converts an {@link ExperimentDefinition} into an {@link ExperimentDefinitionFromStorage}.
 */
export function toStorageExperimentDefinition(
  experimentDefinition: ExperimentDefinition
): ExperimentDefinitionFromStorage {
  switch (experimentDefinition.experimentType) {
    case ExperimentType.Boolean:
      return {
        experimentId: experimentDefinition.experimentId,
        experimentType: ExperimentType.Boolean,
        defaultIsEnabled: experimentDefinition.defaultIsEnabled,
        environments: [...experimentDefinition.environments],
        visibility: experimentDefinition.visibility,
        title: experimentDefinition.title,
        description: experimentDefinition.description,
      };
    case ExperimentType.String:
      return {
        experimentId: experimentDefinition.experimentId,
        experimentType: ExperimentType.String,
        environments: [...experimentDefinition.environments],
        visibility: experimentDefinition.visibility,
        title: experimentDefinition.title,
        description: experimentDefinition.description,
        defaultIsEnabled: experimentDefinition.defaultIsEnabled,
        defaultValue: experimentDefinition.defaultValue,
      };
    default:
      assertNever(experimentDefinition);
  }
}

/**
 * Converts an {@link ExperimentDefinitionFromStorage} into an {@link ExperimentDefinition}.
 */
export function fromStorageExperimentDefinition(
  experimentDefinitionFromStorage: ExperimentDefinitionFromStorage
): Result<ExperimentDefinition, Error> {
  switch (experimentDefinitionFromStorage.experimentType) {
    case ExperimentType.Boolean:
      return makeSuccessResult({
        experimentType: ExperimentType.Boolean,
        defaultIsEnabled: experimentDefinitionFromStorage.defaultIsEnabled,
        experimentId: experimentDefinitionFromStorage.experimentId,
        environments: experimentDefinitionFromStorage.environments,
        visibility: experimentDefinitionFromStorage.visibility,
        title: experimentDefinitionFromStorage.title,
        description: experimentDefinitionFromStorage.description,
      });
    case ExperimentType.String:
      return makeSuccessResult({
        experimentType: ExperimentType.String,
        defaultIsEnabled: experimentDefinitionFromStorage.defaultIsEnabled,
        defaultValue: experimentDefinitionFromStorage.defaultValue,
        experimentId: experimentDefinitionFromStorage.experimentId,
        environments: experimentDefinitionFromStorage.environments,
        visibility: experimentDefinitionFromStorage.visibility,
        title: experimentDefinitionFromStorage.title,
        description: experimentDefinitionFromStorage.description,
      });
    default:
      assertNever(experimentDefinitionFromStorage);
  }
}

/**
 * Converts an {@link AccountExperimentsState} into an {@link AccountExperimentsStateFromStorage}.
 */
export function toStorageAccountExperimentsState(
  accountExperimentsState: AccountExperimentsState
): AccountExperimentsStateFromStorage {
  const experimentOverridesFromStorage = mapObjectValues(
    accountExperimentsState.experimentOverrides,
    toStorageExperimentOverride
  );

  return {
    accountId: accountExperimentsState.accountId,
    accountVisibility: accountExperimentsState.accountVisibility,
    experimentOverrides: experimentOverridesFromStorage,
    createdTime: accountExperimentsState.createdTime,
    lastUpdatedTime: accountExperimentsState.lastUpdatedTime,
  };
}

function toStorageExperimentOverride(
  experimentOverride: ExperimentOverride
): ExperimentOverrideFromStorage {
  switch (experimentOverride.experimentType) {
    case ExperimentType.Boolean:
      return toStorageBooleanExperimentOverride(experimentOverride);
    case ExperimentType.String:
      return toStorageStringExperimentOverride(experimentOverride);
    default:
      assertNever(experimentOverride);
  }
}

function toStorageBooleanExperimentOverride(
  experimentOverride: BooleanExperimentOverride
): BooleanExperimentOverrideFromStorage {
  return {
    experimentId: experimentOverride.experimentId,
    experimentType: ExperimentType.Boolean,
    isEnabled: experimentOverride.isEnabled,
  };
}

function toStorageStringExperimentOverride(
  experimentOverride: StringExperimentOverride
): StringExperimentOverrideFromStorage {
  return {
    experimentId: experimentOverride.experimentId,
    experimentType: ExperimentType.String,
    value: experimentOverride.value,
    isEnabled: experimentOverride.isEnabled,
  };
}

/**
 * Converts an {@link AccountExperimentsStateFromStorage} into an {@link AccountExperimentsState}.
 */
export function fromStorageAccountExperimentsState(
  accountExperimentsStateFromStorage: AccountExperimentsStateFromStorage
): Result<AccountExperimentsState, Error> {
  const parsedAccountId = parseAccountId(accountExperimentsStateFromStorage.accountId);
  if (!parsedAccountId.success) return parsedAccountId;

  const experimentOverrides = mapObjectValues(
    accountExperimentsStateFromStorage.experimentOverrides,
    fromStorageExperimentOverride,
    (key) => key in ALL_EXPERIMENT_DEFINITIONS
  );

  return makeSuccessResult({
    accountId: parsedAccountId.value,
    accountVisibility: accountExperimentsStateFromStorage.accountVisibility,
    experimentOverrides,
    createdTime: accountExperimentsStateFromStorage.createdTime,
    lastUpdatedTime: accountExperimentsStateFromStorage.lastUpdatedTime,
  });
}

function fromStorageExperimentOverride(
  experimentOverrideFromStorage: ExperimentOverrideFromStorage
): ExperimentOverride {
  switch (experimentOverrideFromStorage.experimentType) {
    case ExperimentType.Boolean:
      return fromStorageBooleanExperimentOverride(experimentOverrideFromStorage);
    case ExperimentType.String:
      return fromStorageStringExperimentOverride(experimentOverrideFromStorage);
    default:
      assertNever(experimentOverrideFromStorage);
  }
}

function fromStorageBooleanExperimentOverride(
  experimentOverrideFromStorage: BooleanExperimentOverrideFromStorage
): BooleanExperimentOverride {
  return {
    experimentType: ExperimentType.Boolean,
    experimentId: experimentOverrideFromStorage.experimentId,
    isEnabled: experimentOverrideFromStorage.isEnabled,
  };
}

function fromStorageStringExperimentOverride(
  experimentOverrideFromStorage: StringExperimentOverrideFromStorage
): StringExperimentOverride {
  return {
    experimentType: ExperimentType.String,
    experimentId: experimentOverrideFromStorage.experimentId,
    value: experimentOverrideFromStorage.value,
    isEnabled: experimentOverrideFromStorage.isEnabled,
  };
}
