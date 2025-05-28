import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import type {
  BooleanExperimentDefinition,
  EnumExperimentDefinition,
  ExperimentDefinition,
  StringExperimentDefinition,
} from '@shared/types/experiments.types';
import {ExperimentType} from '@shared/types/experiments.types';
import type {Result} from '@shared/types/results.types';

import {
  BaseExperimentDefinitionFromStorageSchema,
  BooleanExperimentDefinitionFromStorageSchema,
  EnumExperimentDefinitionFromStorageSchema,
  StringExperimentDefinitionFromStorageSchema,
} from '@shared/schemas/experiments.schema';
import type {
  BaseExperimentDefinitionFromStorage,
  BooleanExperimentDefinitionFromStorage,
  EnumExperimentDefinitionFromStorage,
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
    return prefixErrorResult(parsedExperimentResult, 'Invalid experiment');
  }

  switch (parsedExperimentResult.value.experimentType) {
    case ExperimentType.Boolean:
      return parseBooleanExperiment({maybeExperimentDefinition});
    case ExperimentType.String:
      return parseStringExperiment({maybeExperimentDefinition});
    case ExperimentType.Enum:
      return parseEnumExperiment({maybeExperimentDefinition});
    default:
      return makeErrorResult(
        new Error(`Unknown experiment type: ${parsedExperimentResult.value.experimentType}`)
      );
  }
}

export function parseBooleanExperiment(args: {
  readonly maybeExperimentDefinition: unknown;
}): Result<BooleanExperimentDefinition> {
  const {maybeExperimentDefinition} = args;

  const parsedExperimentResult = parseZodResult<BooleanExperimentDefinitionFromStorage>(
    BooleanExperimentDefinitionFromStorageSchema,
    maybeExperimentDefinition
  );
  if (!parsedExperimentResult.success) {
    return prefixErrorResult(parsedExperimentResult, 'Invalid boolean experiment');
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

export function parseStringExperiment(args: {
  readonly maybeExperimentDefinition: unknown;
}): Result<StringExperimentDefinition> {
  const {maybeExperimentDefinition} = args;

  const parsedExperimentResult = parseZodResult<StringExperimentDefinitionFromStorage>(
    StringExperimentDefinitionFromStorageSchema,
    maybeExperimentDefinition
  );
  if (!parsedExperimentResult.success) {
    return prefixErrorResult(parsedExperimentResult, 'Invalid string experiment');
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

export function parseEnumExperiment(args: {
  readonly maybeExperimentDefinition: unknown;
}): Result<EnumExperimentDefinition> {
  const {maybeExperimentDefinition} = args;

  const parsedExperimentResult = parseZodResult<EnumExperimentDefinitionFromStorage>(
    EnumExperimentDefinitionFromStorageSchema,
    maybeExperimentDefinition
  );
  if (!parsedExperimentResult.success) {
    return prefixErrorResult(parsedExperimentResult, 'Invalid enum experiment');
  }
  const storageEnumExperiment = parsedExperimentResult.value;

  return makeSuccessResult(
    omitUndefined({
      experimentType: ExperimentType.Enum,
      defaultValue: storageEnumExperiment.defaultValue,
      options: storageEnumExperiment.options,
      experimentId: storageEnumExperiment.experimentId,
      environments: storageEnumExperiment.environments,
      visibility: storageEnumExperiment.visibility,
      title: storageEnumExperiment.title,
      description: storageEnumExperiment.description,
    })
  );
}

/**
 * Converts an {@link ExperimentDefinition} to an {@link ExperimentDefinitionFromStorage} object
 * that can be persisted to Firestore.
 */
export function toStorageExperiment(
  experiment: ExperimentDefinition
): ExperimentDefinitionFromStorage {
  switch (experiment.experimentType) {
    case ExperimentType.Boolean:
      return toStorageBooleanExperiment(experiment);
    case ExperimentType.String:
      return toStorageStringExperiment(experiment);
    case ExperimentType.Enum:
      return toStorageEnumExperiment(experiment);
    default:
      logger.error(new Error('Unknown experiment type'), {experiment});
      return toStorageBooleanExperiment(experiment);
  }
}

/**
 * Converts a {@link BooleanExperimentDefinition} to a {@link BooleanExperimentDefinitionFromStorage} object that can be
 * persisted to Firestore.
 */
function toStorageBooleanExperiment(
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
function toStorageStringExperiment(
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
 * Converts an {@link EnumExperimentDefinition} to a {@link EnumExperimentDefinitionFromStorage} object that can be
 * persisted to Firestore.
 */
function toStorageEnumExperiment(
  experiment: EnumExperimentDefinition
): EnumExperimentDefinitionFromStorage {
  return omitUndefined({
    experimentId: experiment.experimentId,
    experimentType: ExperimentType.Enum,
    defaultValue: experiment.defaultValue,
    options: [...experiment.options],
    environments: [...experiment.environments],
    visibility: experiment.visibility,
    title: experiment.title,
    description: experiment.description,
  });
}
