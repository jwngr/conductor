import {isDefined} from '@shared/lib/utils.shared';

import type {Func} from '@shared/types/utils.types';

type ObjectKey = string | number | symbol;

/**
 * Typed helper for converting an array of entries into a record.
 */
export function objectFromEntries<Key extends ObjectKey, Value>(
  entries: Array<[Key, Value]>
): Record<Key, Value> {
  return Object.fromEntries(entries) as Record<Key, Value>;
}

/**
 * Omits all undefined values from the provided object.
 */
export function objectOmitUndefined<T extends object>(
  obj: T
): Record<keyof T, Exclude<T[keyof T], undefined>> {
  const originalEntries = objectEntries(obj);
  const filteredEntries = originalEntries.filter(isDefined);
  return objectFromEntries(filteredEntries);
}

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
export function objectEntries<T extends object>(
  obj: T
): Array<[keyof T, Exclude<T[keyof T], undefined>]> {
  return Object.entries(obj) as Array<[keyof T, Exclude<T[keyof T], undefined>]>;
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
 * Typed helper for filtering an object by its keys.
 */
export function objectFilterKeys<Key extends ObjectKey, Value>(
  obj: Partial<Record<Key, Value>>,
  predicate: (key: Key) => boolean
): Partial<Record<Key, Value>> {
  const entries = objectEntries(obj).filter(([key]) => predicate(key));
  return objectFromEntries(entries);
}

/**
 * Typed helper for filtering an object by its values.
 */
export function objectFilterValues<Key extends ObjectKey, Value>(
  obj: Partial<Record<Key, Value>>,
  predicate: (value: Value) => boolean
): Partial<Record<Key, Value>> {
  const entries = objectEntries(obj).filter(([, value]) => predicate(value));
  return objectFromEntries(entries);
}

/**
 * Typed helper for filtering an object by its entries.
 */
export function objectFilterEntries<Key extends ObjectKey, Value>(
  obj: Partial<Record<Key, Value>>,
  predicate: (key: Key, value: Value) => boolean
): Partial<Record<Key, Value>> {
  const entries = objectEntries(obj).filter(([key, value]) => predicate(key, value));
  return objectFromEntries(entries);
}

/**
 * Typed helper for mapping over object keys and returning a new object with transformed keys.
 */
export function objectMapKeys<StartKey extends ObjectKey, Value, EndKey extends ObjectKey>(
  obj: Partial<Record<StartKey, Value>>,
  mapper: Func<StartKey, EndKey>
): Record<EndKey, Value> {
  const originalEntries = objectEntries(obj);
  const updatedEntries: Array<[EndKey, Value]> = originalEntries.map(([key, value]) => [
    mapper(key),
    value,
  ]);
  return objectFromEntries(updatedEntries);
}

/**
 * Typed helper for mapping over object values and returning a new object with the same keys, but
 * each value having been transformed by `mapper`.
 */
export function objectMapValues<StartValue, EndValue>(
  obj: Partial<Record<ObjectKey, StartValue>>,
  mapper: Func<StartValue, EndValue>
): Record<ObjectKey, EndValue> {
  const originalEntries = objectEntries(obj);
  const updatedEntries: Array<[ObjectKey, EndValue]> = originalEntries.map(([key, value]) => [
    key,
    mapper(value),
  ]);
  return objectFromEntries(updatedEntries);
}

/**
 * Typed helper for mapping over object entries and returning an array of values transformed by
 * `mapper`.
 */
export function objectMapEntries<T extends object, Result>(
  obj: T,
  mapper: (key: keyof T, value: T[keyof T]) => Result
): Result[] {
  const entries = objectEntries(obj);
  return entries.map(([key, value]) => mapper(key, value));
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
