import {
  arrayFilter,
  arrayFilterUndefined,
  arrayForEach,
  arrayMap,
  arrayReduce,
} from '@shared/lib/arrayUtils.shared';

import type {Func} from '@shared/types/utils.types';

type ObjectKey = string | number | symbol;

/**
 * Returns a copy of the provided object with all undefined values omitted.
 */
export function objectOmitUndefined<T extends object>(
  obj: T
): Record<keyof T, Exclude<T[keyof T], undefined>> {
  const originalEntries = objectEntries(obj);
  const filteredEntries = arrayFilterUndefined(originalEntries);
  return Object.fromEntries(filteredEntries) as Record<keyof T, Exclude<T[keyof T], undefined>>;
}

/**
 * Typed helper for getting the size of an object.
 */
export function objectSize<T extends object>(obj: T): number {
  return Object.keys(obj).length;
}

/**
 * Typed helper for getting all keys from an object.
 */
export function objectKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Typed helper for getting all values from an object.
 */
export function objectValues<T extends object>(obj: T): Array<T[keyof T]> {
  return Object.values(obj) as Array<T[keyof T]>;
}

/**
 * Typed helper for getting all entries from an object.
 */
export function objectEntries<T extends object>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Typed helper for iterating over and calling `callback` for each key in an object.
 */
export function objectForEachKey<T extends object>(
  obj: T,
  callback: (key: keyof T, index: number, array: ReadonlyArray<keyof T>) => void
): void {
  const keysArray = objectKeys(obj);
  arrayForEach(keysArray, callback);
}

/**
 * Typed helper for iterating over and calling `callback` for each value in an object.
 */
export function objectForEachValue<T extends object>(
  obj: T,
  callback: (value: T[keyof T], index: number, array: ReadonlyArray<T[keyof T]>) => void
): void {
  const valuesArray = objectValues(obj);
  arrayForEach(valuesArray, callback);
}

/**
 * Typed helper for iterating over and calling `callback` for each key-value pair in an object.
 */
export function objectForEachEntry<T extends object>(
  obj: T,
  callback: (
    key: keyof T,
    value: T[keyof T],
    index: number,
    array: ReadonlyArray<[keyof T, T[keyof T]]>
  ) => void
): void {
  const entriesArray = objectEntries(obj);
  arrayForEach(entriesArray, ([key, value], index, array) => callback(key, value, index, array));
}

/**
 * Typed helper for filtering an object by its keys.
 */
export function objectFilterKeys<T extends object>(
  obj: T,
  predicate: (key: keyof T) => boolean
): Record<keyof T, T[keyof T]> {
  const allEntries = objectEntries(obj);
  const filteredEntries = arrayFilter(allEntries, ([key]) => predicate(key));
  return Object.fromEntries(filteredEntries) as Record<keyof T, T[keyof T]>;
}

/**
 * Typed helper for filtering an object by its values.
 */
export function objectFilterValues<T extends object>(
  obj: T,
  predicate: (value: T[keyof T]) => boolean
): Record<keyof T, T[keyof T]> {
  const allEntries = objectEntries(obj);
  const filteredEntries = arrayFilter(allEntries, ([, value]) => predicate(value));
  return Object.fromEntries(filteredEntries) as Record<keyof T, T[keyof T]>;
}

/**
 * Typed helper for filtering an object by its entries.
 */
export function objectFilterEntries<T extends object>(
  obj: T,
  predicate: (key: keyof T, value: T[keyof T]) => boolean
): Record<keyof T, T[keyof T]> {
  const allEntries = objectEntries(obj);
  const filteredEntries = arrayFilter(allEntries, ([key, value]) => predicate(key, value));
  return Object.fromEntries(filteredEntries) as Record<keyof T, T[keyof T]>;
}

/**
 * Typed helper for mapping over object keys and returning a new object with transformed keys.
 */
export function objectMapKeys<T extends object, EndKey extends ObjectKey>(
  obj: T,
  mapper: Func<keyof T, EndKey>
): Record<EndKey, T[keyof T]> {
  const originalEntries = objectEntries(obj);
  const updatedEntries: Array<[EndKey, T[keyof T]]> = arrayMap(originalEntries, ([key, value]) => [
    mapper(key),
    value,
  ]);
  return Object.fromEntries(updatedEntries) as Record<EndKey, T[keyof T]>;
}

/**
 * Typed helper for mapping over object values and returning a new object with the same keys, but
 * each value having been transformed by `mapper`.
 */
export function objectMapValues<Result, T extends object = object>(
  obj: T,
  mapper: Func<T[keyof T], Result>
): Record<keyof T, Result> {
  const originalEntries = objectEntries(obj);
  const updatedEntries: Array<[keyof T, Result]> = arrayMap(originalEntries, ([key, value]) => [
    key,
    mapper(value),
  ]);
  return Object.fromEntries(updatedEntries) as Record<keyof T, Result>;
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
  return arrayMap(entries, ([key, value]) => mapper(key, value));
}

/**
 * Typed helper for reducing all values in an object into a single value.
 */
export function objectReduceValues<T extends object, Accumulator>(
  obj: T,
  reducer: (
    accumulator: Accumulator,
    currentValue: T[keyof T],
    currentIndex: number,
    array: ReadonlyArray<T[keyof T]>
  ) => Accumulator,
  initialValue: Accumulator
): Accumulator {
  const allValues = objectValues(obj);
  return arrayReduce(allValues, reducer, initialValue);
}
