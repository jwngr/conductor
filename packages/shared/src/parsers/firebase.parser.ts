import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {FirebaseConfig} from '@shared/types/firebase.types';
import type {Result} from '@shared/types/results.types';

import {FirebaseConfigSchema} from '@shared/schemas/firebase.schema';

/**
 * Attempts to parse an unknown value into an {@link FirebaseConfig}.
 */
export function parseFirebaseConfig(maybeConfig: unknown): Result<FirebaseConfig, Error> {
  const parsedResult = parseZodResult(FirebaseConfigSchema, maybeConfig);
  if (!parsedResult.success) return parsedResult;
  return makeSuccessResult(parsedResult.value as FirebaseConfig);
}
