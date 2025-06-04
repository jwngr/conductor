import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {AccountExperimentsState, ExperimentDefinition} from '@shared/types/experiments.types';
import type {Result} from '@shared/types/results.types';

import type {
  AccountExperimentsStateFromStorage,
  ExperimentDefinitionFromStorage,
} from '@shared/schemas/experiments.schema';
import {
  AccountExperimentsStateSchema,
  ExperimentDefinitionSchema,
} from '@shared/schemas/experiments.schema';
import {
  fromStorageAccountExperimentsState,
  fromStorageExperimentDefinition,
} from '@shared/storage/experiments.storage';

/**
 * Attempts to parse an unknown value into an {@link ExperimentDefinition}.
 */
export function parseExperimentDefinition(
  maybeExperimentDefinition: unknown
): Result<ExperimentDefinition> {
  const parsedExpDefinitionResult = parseZodResult<ExperimentDefinitionFromStorage>(
    ExperimentDefinitionSchema,
    maybeExperimentDefinition
  );
  if (!parsedExpDefinitionResult.success) {
    return prefixErrorResult(parsedExpDefinitionResult, 'Invalid experiment definition');
  }

  const experimentDefinitionFromStorage = parsedExpDefinitionResult.value;
  return fromStorageExperimentDefinition(experimentDefinitionFromStorage);
}

/**
 * Attempts to parse an unknown value into an {@link AccountExperimentsState}.
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

  const accountExperimentsStateFromStorage = parsedAccountExperimentsStateResult.value;
  return fromStorageAccountExperimentsState(accountExperimentsStateFromStorage);
}
