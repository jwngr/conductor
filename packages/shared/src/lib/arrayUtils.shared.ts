import type {Func} from '@shared/types/utils.types';

/**
 * Typed helper for iterating over an array and calling `callback` for each value.
 */
export function arrayForEach<T>(arr: T[], callback: Func<T, void>): void {
  arr.forEach(callback);
}

/**
 * Typed helper for filtering an array to only include values that pass the `filter` predicate.
 */
export function arrayFilter<T>(arr: T[], filter: Func<T, boolean>): T[] {
  return arr.filter(filter);
}

/**
 * Typed helper for mapping over an array and returning a new array of values transformed by
 * `mapper`.
 */
export function arrayMap<Start, End>(arr: Start[], mapper: Func<Start, End>): End[] {
  return arr.map(mapper);
}

/**
 * Typed helper for checking if any values in an array pass the `predicate`.
 */
export function arraySome<T>(arr: T[], predicate: Func<T, boolean>): boolean {
  return arr.some(predicate);
}

/**
 * Typed helper for checking if all values in an array pass the `predicate`.
 */
export function arrayEvery<T>(arr: T[], predicate: Func<T, boolean>): boolean {
  return arr.every(predicate);
}

/**
 * Typed helper for reducing an array to a single value.
 */
export function arrayReduce<Start, Accumulator>(
  arr: readonly Start[],
  reducer: (
    accumulator: Accumulator,
    currentValue: Start,
    currentIndex: number,
    array: readonly Start[]
  ) => Accumulator,
  initialValue: Accumulator
): Accumulator {
  return (arr as Start[]).reduce(reducer, initialValue);
}

/**
 * Typed helper for sorting an array.
 */
export function arraySort<T>(arr: T[], comparator: (a: T, b: T) => number): T[] {
  return arr.sort(comparator);
}

/**
 * Typed helper for converting an array of items into a record.
 */
export function arrayToRecord<Item, Key extends string | number | symbol>(
  items: readonly Item[],
  getKey: Func<Item, Key>
): Record<Key, Item> {
  return items.reduce(
    (acc, item) => {
      acc[getKey(item)] = item;
      return acc;
    },
    {} as Record<Key, Item>
  );
}
