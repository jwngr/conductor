import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {omitUndefined, safeAssertNever} from '@shared/lib/utils.shared';

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
  AccountExperimentsStateSchema,
  BaseExperimentDefinitionSchema,
  BooleanExperimentDefinitionSchema,
  StringExperimentDefinitionSchema,
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
  const parsedExpDefinitionResult = parseZodResult<BaseExperimentDefinitionFromStorage>(
    BaseExperimentDefinitionSchema,
    maybeExperimentDefinition
  );
  if (!parsedExpDefinitionResult.success) {
    return prefixErrorResult(parsedExpDefinitionResult, 'Invalid experiment definition');
  }

  const parsedExpDefinition = parsedExpDefinitionResult.value;
  switch (parsedExpDefinition.experimentType) {
    case ExperimentType.Boolean:
      return parseBooleanExperimentDefinition({maybeExperimentDefinition});
    case ExperimentType.String:
      return parseStringExperimentDefinition({maybeExperimentDefinition});
    default:
      safeAssertNever(parsedExpDefinition.experimentType);
      return makeErrorResult(
        new Error(`Unknown experiment type: ${parsedExpDefinition.experimentType}`)
      );
  }
}

function parseBooleanExperimentDefinition(args: {
  readonly maybeExperimentDefinition: unknown;
}): Result<BooleanExperimentDefinition> {
  const {maybeExperimentDefinition} = args;

  const parsedExperimentResult = parseZodResult<BooleanExperimentDefinitionFromStorage>(
    BooleanExperimentDefinitionSchema,
    maybeExperimentDefinition
  );
  if (!parsedExperimentResult.success) {
    return prefixErrorResult(parsedExperimentResult, 'Invalid boolean experiment definition');
  }
  const storageBooleanExperiment = parsedExperimentResult.value;

  return makeSuccessResult(
    omitUndefined({
      experimentType: ExperimentType.Boolean,
      defaultIsEnabled: storageBooleanExperiment.defaultIsEnabled,
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
    StringExperimentDefinitionSchema,
    maybeExperimentDefinition
  );
  if (!parsedExperimentResult.success) {
    return prefixErrorResult(parsedExperimentResult, 'Invalid string experiment definition');
  }
  const storageStringExperiment = parsedExperimentResult.value;

  return makeSuccessResult(
    omitUndefined({
      experimentType: ExperimentType.String,
      defaultIsEnabled: storageStringExperiment.defaultIsEnabled,
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
  experimentDefinition: ExperimentDefinition
): ExperimentDefinitionFromStorage {
  switch (experimentDefinition.experimentType) {
    case ExperimentType.Boolean:
      return toStorageBooleanExperimentDefinition(experimentDefinition);
    case ExperimentType.String:
      return toStorageStringExperimentDefinition(experimentDefinition);
    default:
      safeAssertNever(experimentDefinition);
      logger.error(new Error('Unknown experiment type'), {experimentDefinition});
      return toStorageBooleanExperimentDefinition(experimentDefinition);
  }
}

/**
 * Converts a {@link BooleanExperimentDefinition} to a {@link BooleanExperimentDefinitionFromStorage} object that can be
 * persisted to Firestore.
 */
function toStorageBooleanExperimentDefinition(
  experimentDefinition: BooleanExperimentDefinition
): BooleanExperimentDefinitionFromStorage {
  return omitUndefined({
    experimentId: experimentDefinition.experimentId,
    experimentType: ExperimentType.Boolean,
    defaultIsEnabled: experimentDefinition.defaultIsEnabled,
    environments: [...experimentDefinition.environments],
    visibility: experimentDefinition.visibility,
    title: experimentDefinition.title,
    description: experimentDefinition.description,
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
    defaultIsEnabled: experiment.defaultIsEnabled,
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
    AccountExperimentsStateSchema,
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
