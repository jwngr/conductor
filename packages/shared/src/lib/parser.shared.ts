import type {ZodSchema} from 'zod';

import {isDate} from '@shared/lib/datetime.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import type {Result} from '@shared/types/results.types';
import type {BaseStoreItem, Supplier} from '@shared/types/utils.types';

import type {FirestoreTimestamp} from '@shared/schemas/firebase.schema';

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
export function parseStorageTimestamp(firestoreDate: FirestoreTimestamp | Date): Date {
  // Firestore timestamp created locally are initialized to null. Consider them to be now.
  if (firestoreDate === null) return new Date();

  if (isDate(firestoreDate)) return firestoreDate;

  return firestoreDate.toDate();
}

/**
 * Returns the provided item with `createdTime` and `lastUpdatedTime` replaced with the provided
 * Firestore timestamp factory.
 */
export function withFirestoreTimestamps<ItemData extends BaseStoreItem, Timestamp>(
  item: ItemData,
  timestampFactory: Supplier<Timestamp>
): Omit<ItemData, 'createdTime' | 'lastUpdatedTime'> & {
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
} {
  return omitUndefined({
    ...item,
    createdTime: timestampFactory(),
    lastUpdatedTime: timestampFactory(),
  });
}

/**
 * Returns the provided item with `createdTime`, `lastUpdatedTime`, and an additional timestamp
 * field replaced with the provided Firestore timestamp factory.
 */
export function withFirestoreTimestampsExtended<
  ItemData extends BaseStoreItem,
  Timestamp,
  AdditionalTimestampField extends string = never,
>(
  item: ItemData & Partial<Record<AdditionalTimestampField, Date>>,
  timestampFactory: Supplier<Timestamp>,
  additionalTimestampField: AdditionalTimestampField
): Omit<ItemData, 'createdTime' | 'lastUpdatedTime' | AdditionalTimestampField> & {
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
} {
  return omitUndefined({
    ...item,
    createdTime: timestampFactory(),
    lastUpdatedTime: timestampFactory(),
    [additionalTimestampField]: timestampFactory(),
  });
}
