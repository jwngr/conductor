import type {ZodSchema} from 'zod';

import type {FirestoreTimestamp} from '@shared/types/firebase.types';
import type {Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

/**
 * Parses a value using a Zod schema and returns a `SuccessResult` with the parsed value if
 * successful, or an `ErrorResult` if the value is invalid.
 */
export function parseZodResult<T>(zodSchema: ZodSchema<T>, value: unknown): Result<T> {
  const zodResult = zodSchema.safeParse(value);

  if (!zodResult.success) {
    const formattedError = zodResult.error.format();
    const errorMessage = Object.entries(formattedError)
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => {
        if (value && '_errors' in value) {
          const errors = value._errors.join(', ');
          return `${key} (${errors})`;
        }
        return `${key} (${value})`;
      })
      .join(', ');
    return makeErrorResult(
      new Error(`Error parsing value with Zod: ${errorMessage}`, {cause: zodResult.error})
    );
  }

  return makeSuccessResult(zodResult.data);
}

// TODO: Move this to a utility file.
function isDate(value: unknown): value is Date {
  return typeof value === 'object' && value !== null && 'toDate' in value;
}

/**
 * Converts a Firestore `Timestamp` to a normal `Date`.
 */
export function parseStorageTimestamp(firestoreDate: FirestoreTimestamp | Date): Date {
  return isDate(firestoreDate) ? firestoreDate : firestoreDate.toDate();
}
