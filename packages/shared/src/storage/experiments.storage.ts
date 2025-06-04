import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {AccountExperimentsState, ExperimentDefinition} from '@shared/types/experiments.types';
import {ExperimentType} from '@shared/types/experiments.types';
import type {Result} from '@shared/types/results.types';

import type {
  AccountExperimentsStateFromStorage,
  ExperimentDefinitionFromStorage,
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
): Result<ExperimentDefinition> {
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
  return {
    accountId: accountExperimentsState.accountId,
    accountVisibility: accountExperimentsState.accountVisibility,
    experimentOverrides: accountExperimentsState.experimentOverrides,
    createdTime: accountExperimentsState.createdTime,
    lastUpdatedTime: accountExperimentsState.lastUpdatedTime,
  };
}

/**
 * Converts an {@link AccountExperimentsStateFromStorage} into an {@link AccountExperimentsState}.
 */
export function fromStorageAccountExperimentsState(
  accountExperimentsStateFromStorage: AccountExperimentsStateFromStorage
): Result<AccountExperimentsState> {
  const parsedAccountId = parseAccountId(accountExperimentsStateFromStorage.accountId);
  if (!parsedAccountId.success) return parsedAccountId;

  return makeSuccessResult({
    accountId: parsedAccountId.value,
    accountVisibility: accountExperimentsStateFromStorage.accountVisibility,
    experimentOverrides: accountExperimentsStateFromStorage.experimentOverrides,
    createdTime: accountExperimentsStateFromStorage.createdTime,
    lastUpdatedTime: accountExperimentsStateFromStorage.lastUpdatedTime,
  });
}
