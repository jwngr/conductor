import {prettifyError, type ZodType} from 'zod/v4';

import {isDate} from '@shared/lib/datetime.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';
import type {BaseStoreItem, Supplier} from '@shared/types/utils.types';

import type {FirestoreTimestamp} from '@shared/schemas/firebase.schema';

/**
 * Attempts to parse a value using a Zod schema.
 */
export function parseZodResult<T>(zodSchema: ZodType<T>, value: unknown): Result<T, Error> {
  const zodResult = zodSchema.safeParse(value);

  if (!zodResult.success) {
    const errorMessage = prettifyError(zodResult.error);
    return makeErrorResult(
      new Error(`Zod parsing failed: ${errorMessage}`, {cause: zodResult.error})
    );
  }

  return makeSuccessResult(zodResult.data as T);
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
  return {
    ...item,
    createdTime: timestampFactory(),
    lastUpdatedTime: timestampFactory(),
  };
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
  return {
    ...item,
    createdTime: timestampFactory(),
    lastUpdatedTime: timestampFactory(),
    [additionalTimestampField]: timestampFactory(),
  };
}
