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

/**
 * Converts a Firestore `Timestamp` to a normal `Date`.
 */
export function parseStorageTimestamp(firestoreDate: FirestoreTimestamp): Date {
  // TODO: For some reason this returns "Invalid date" when used from the server, but the function
  // does exist.
  return firestoreDate.toDate();
}

/**
 * Converts a normal `Date` into a Firestore `Timestamp`.
 */
export function toStorageTimestamp(appDate: Date): FirestoreTimestamp {
  // TODO: This uses an import from the client library and could be wrong from the server. Ideally
  // this method would not rely on the client library.
  // TODO: The types here are a bit whacky.
  return appDate as unknown as FirestoreTimestamp;
}
