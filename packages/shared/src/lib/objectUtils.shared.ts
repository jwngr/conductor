import {arrayFilter} from '@shared/lib/arrayUtils.shared';

import type {Func} from '@shared/types/utils.types';

type ObjectKey = string | number | symbol;

/**
 * Typed helper for converting an object's keys to an array.
 */
export function objectKeys<Key extends ObjectKey>(obj: Partial<Record<Key, unknown>>): Key[] {
  return Object.keys(obj) as Key[];
}

/**
 * Typed helper for getting all values from an object.
 */
export function objectValues<Value>(obj: Partial<Record<ObjectKey, Value>>): Value[] {
  return Object.values(obj) as Value[];
}

/**
 * Typed helper for getting all entries from an object.
 */
export function objectEntries<Key extends ObjectKey, Value>(
  obj: Partial<Record<Key, Value>>
): Array<[Key, Value]> {
  return Object.entries(obj) as Array<[Key, Value]>;
}

/**
 * Typed helper for iterating over and calling `callback` for each key in an object.
 */
export function objectForEachKey<Key extends ObjectKey>(
  obj: Partial<Record<Key, unknown>>,
  callback: (key: Key, index: number, array: readonly Key[]) => void
): void {
  objectKeys(obj).forEach(callback);
}

/**
 * Typed helper for iterating over and calling `callback` for each value in an object.
 */
export function objectForEachValue<Key extends ObjectKey, Value>(
  obj: Partial<Record<Key, Value>>,
  callback: (value: Value, index: number, array: readonly Value[]) => void
): void {
  objectValues(obj).forEach(callback);
}

/**
 * Typed helper for iterating over and calling `callback` for each key-value pair in an object.
 */
export function objectForEachEntry<Key extends ObjectKey, Value>(
  obj: Partial<Record<Key, Value>>,
  callback: (key: Key, value: Value, index: number, array: ReadonlyArray<[Key, Value]>) => void
): void {
  objectEntries(obj).forEach(([key, value], index, array) => callback(key, value, index, array));
}

/**
 * Typed helper for mapping over object values and returning a new object with the same keys, but
 * each value having been transformed by `mapper`.
 */
export function objectMapValues<StartValue, EndValue>(
  obj: Partial<Record<ObjectKey, StartValue>>,
  mapper: Func<StartValue, EndValue>,
  filter?: Func<ObjectKey, boolean>
): Record<ObjectKey, EndValue> {
  const entries = Object.entries(obj).map(([key, value]) => [
    key as ObjectKey,
    mapper(value as StartValue),
  ]);
  const filteredEntries = filter
    ? arrayFilter(entries, ([key]) => filter(key as ObjectKey))
    : entries;
  return Object.fromEntries(filteredEntries);
}

/**
 * Typed helper for mapping over object entries and returning an array of values transformed by
 * `mapper`.
 */
export function objectMapEntries<Key extends ObjectKey, Value, Result>(
  obj: Partial<Record<Key, Value>>,
  mapper: (key: Key, value: Value) => Result
): Result[] {
  return (Object.entries(obj) as Array<[Key, Value]>).map(([key, value]) => mapper(key, value));
}

/**
 * Omits all undefined values from the provided object.
 */
export function objectOmitUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/**
 * Typed helper for converting an array of entries into a record.
 */
export function objectFromEntries<Key extends ObjectKey, Value>(
  entries: Array<[Key, Value]>
): Record<Key, Value> {
  return Object.fromEntries(entries) as Record<Key, Value>;
}

/**
 * Typed helper for reducing all values in an object into a single value.
 */
export function objectReduceValues<Value, Accumulator>(
  obj: Partial<Record<ObjectKey, Value>>,
  reducer: (
    accumulator: Accumulator,
    currentValue: Value,
    currentIndex: number,
    array: readonly Value[]
  ) => Accumulator,
  initialValue: Accumulator
): Accumulator {
  return objectValues(obj).reduce(reducer, initialValue);
}
