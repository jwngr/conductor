import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {
  AccountExperimentsState,
  BooleanExperimentDefinition,
  ExperimentDefinition,
  StringExperimentDefinition,
} from '@shared/types/experiments.types';
import {ExperimentType} from '@shared/types/experiments.types';
import type {Result} from '@shared/types/results.types';

import {
  AccountExperimentsStateFromStorageSchema,
  BaseExperimentDefinitionFromStorageSchema,
  BooleanExperimentDefinitionFromStorageSchema,
  StringExperimentDefinitionFromStorageSchema,
} from '@shared/schemas/experiments.schema';
import type {
  AccountExperimentsStateFromStorage,
  BaseExperimentDefinitionFromStorage,
  BooleanExperimentDefinitionFromStorage,
  ExperimentDefinitionFromStorage,
  StringExperimentDefinitionFromStorage,
} from '@shared/schemas/experiments.schema';

/**
 * Parses an {@link ExperimentDefinition} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
export function parseExperimentDefinition(
  maybeExperimentDefinition: unknown
): Result<ExperimentDefinition> {
  const parsedExperimentResult = parseZodResult<BaseExperimentDefinitionFromStorage>(
    BaseExperimentDefinitionFromStorageSchema,
    maybeExperimentDefinition
  );
  if (!parsedExperimentResult.success) {
    return prefixErrorResult(parsedExperimentResult, 'Invalid experiment definition');
  }

  switch (parsedExperimentResult.value.experimentType) {
    case ExperimentType.Boolean:
      return parseBooleanExperimentDefinition({maybeExperimentDefinition});
    case ExperimentType.String:
      return parseStringExperimentDefinition({maybeExperimentDefinition});
    default:
      return makeErrorResult(
        new Error(`Unknown experiment type: ${parsedExperimentResult.value.experimentType}`)
      );
  }
}

function parseBooleanExperimentDefinition(args: {
  readonly maybeExperimentDefinition: unknown;
}): Result<BooleanExperimentDefinition> {
  const {maybeExperimentDefinition} = args;

  const parsedExperimentResult = parseZodResult<BooleanExperimentDefinitionFromStorage>(
    BooleanExperimentDefinitionFromStorageSchema,
    maybeExperimentDefinition
  );
  if (!parsedExperimentResult.success) {
    return prefixErrorResult(parsedExperimentResult, 'Invalid boolean experiment definition');
  }
  const storageBooleanExperiment = parsedExperimentResult.value;

  return makeSuccessResult(
    omitUndefined({
      experimentType: ExperimentType.Boolean,
      defaultValue: storageBooleanExperiment.defaultValue,
      experimentId: storageBooleanExperiment.experimentId,
      environments: storageBooleanExperiment.environments,
      visibility: storageBooleanExperiment.visibility,
      title: storageBooleanExperiment.title,
      description: storageBooleanExperiment.description,
    })
  );
}

function parseStringExperimentDefinition(args: {
  readonly maybeExperimentDefinition: unknown;
}): Result<StringExperimentDefinition> {
  const {maybeExperimentDefinition} = args;

  const parsedExperimentResult = parseZodResult<StringExperimentDefinitionFromStorage>(
    StringExperimentDefinitionFromStorageSchema,
    maybeExperimentDefinition
  );
  if (!parsedExperimentResult.success) {
    return prefixErrorResult(parsedExperimentResult, 'Invalid string experiment definition');
  }
  const storageStringExperiment = parsedExperimentResult.value;

  return makeSuccessResult(
    omitUndefined({
      experimentType: ExperimentType.String,
      defaultValue: storageStringExperiment.defaultValue,
      experimentId: storageStringExperiment.experimentId,
      environments: storageStringExperiment.environments,
      visibility: storageStringExperiment.visibility,
      title: storageStringExperiment.title,
      description: storageStringExperiment.description,
    })
  );
}

/**
 * Converts an {@link ExperimentDefinition} to an {@link ExperimentDefinitionFromStorage} object
 * that can be persisted to Firestore.
 */
export function toStorageExperimentDefinition(
  experiment: ExperimentDefinition
): ExperimentDefinitionFromStorage {
  switch (experiment.experimentType) {
    case ExperimentType.Boolean:
      return toStorageBooleanExperimentDefinition(experiment);
    case ExperimentType.String:
      return toStorageStringExperimentDefinition(experiment);
    default:
      logger.error(new Error('Unknown experiment type'), {experiment});
      return toStorageBooleanExperimentDefinition(experiment);
  }
}

/**
 * Converts a {@link BooleanExperimentDefinition} to a {@link BooleanExperimentDefinitionFromStorage} object that can be
 * persisted to Firestore.
 */
function toStorageBooleanExperimentDefinition(
  experiment: BooleanExperimentDefinition
): BooleanExperimentDefinitionFromStorage {
  return omitUndefined({
    experimentId: experiment.experimentId,
    experimentType: ExperimentType.Boolean,
    defaultValue: experiment.defaultValue,
    environments: [...experiment.environments],
    visibility: experiment.visibility,
    title: experiment.title,
    description: experiment.description,
  });
}

/**
 * Converts an {@link StringExperimentDefinition} to a {@link StringExperimentDefinitionFromStorage} object that can be
 * persisted to Firestore.
 */
function toStorageStringExperimentDefinition(
  experiment: StringExperimentDefinition
): StringExperimentDefinitionFromStorage {
  return omitUndefined({
    experimentId: experiment.experimentId,
    experimentType: ExperimentType.String,
    environments: [...experiment.environments],
    visibility: experiment.visibility,
    title: experiment.title,
    description: experiment.description,
    defaultValue: experiment.defaultValue,
  });
}

/**
 * Parses an {@link AccountExperimentsState} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
export function parseAccountExperimentsState(
  maybeAccountExperimentsState: unknown
): Result<AccountExperimentsState> {
  const parsedAccountExperimentsStateResult = parseZodResult<AccountExperimentsStateFromStorage>(
    AccountExperimentsStateFromStorageSchema,
    maybeAccountExperimentsState
  );

  if (!parsedAccountExperimentsStateResult.success) {
    const message = 'Invalid account experiments state';
    return prefixErrorResult(parsedAccountExperimentsStateResult, message);
  }

  const parsedAccountExperimentsState = parsedAccountExperimentsStateResult.value;

  const parsedAccountId = parseAccountId(parsedAccountExperimentsState.accountId);
  if (!parsedAccountId.success) {
    return prefixErrorResult(parsedAccountId, 'Invalid account ID');
  }

  return makeSuccessResult({
    accountId: parsedAccountId.value,
    accountVisibility: parsedAccountExperimentsState.accountVisibility,
    experimentOverrides: parsedAccountExperimentsState.experimentOverrides,
    createdTime: parsedAccountExperimentsState.createdTime,
    lastUpdatedTime: parsedAccountExperimentsState.lastUpdatedTime,
  });
}

/**
 * Converts an {@link AccountExperimentsState} to an {@link AccountExperimentsStateFromStorage}
 * object that can be persisted to Firestore.
 */
export function toStorageAccountExperimentsState(
  state: AccountExperimentsState
): AccountExperimentsStateFromStorage {
  return omitUndefined({
    accountId: state.accountId,
    accountVisibility: state.accountVisibility,
    experimentOverrides: state.experimentOverrides,
    createdTime: state.createdTime,
    lastUpdatedTime: state.lastUpdatedTime,
  });
}
