import {Timestamp} from 'firebase/firestore';
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
    const keysWithErrors = Object.keys(zodResult.error.format()).filter((key) => key !== '_errors');
    logger.error(new Error(`Error parsing value with Zod: ${keysWithErrors.join(', ')}`), {
      value, // TODO: Probably should not be logging raw values here.
      error: zodResult.error,
      format: zodResult.error.format(),
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

/**
 * Converts a Firestore `Timestamp` to a normal `Date`.
 */
export function parseFirestoreTimestamp(firestoreDate: Timestamp): Date {
  return firestoreDate.toDate();
}

/**
 * Converts a normal `Date` into a Firestore `Timestamp`.
 */
export function toFirestoreTimestamp(appDate: Date): Timestamp {
  return Timestamp.fromDate(appDate);
}
