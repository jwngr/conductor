import type {ZodSchema} from 'zod';

import {logger} from '@shared/services/logger.shared';

import type {Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

/**
 * Parses a value using a Zod schema and returns a `SuccessResult` with the parsed value if
 * successful, or an `ErrorResult` if the value is invalid.
 */
export function parseZodResult<T>(zodSchema: ZodSchema<T>, value: unknown): Result<T> {
  const zodResult = zodSchema.safeParse(value);

  if (!zodResult.success) {
    logger.error(new Error('Error parsing value with Zod'), {
      value,
      error: zodResult.error,
      issues: zodResult.error.issues,
    });
    return makeErrorResult(
      new Error(
        `Error parsing value: ${JSON.stringify(zodResult.error.issues.map((issue) => issue.message).join(', '))}`,
        {cause: zodResult.error}
      )
    );
  }

  return makeSuccessResult(zodResult.data);
}
