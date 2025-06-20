import {
  arrayFilter,
  arrayFilterNull,
  arrayFilterUndefined,
  arrayForEach,
  arrayMap,
  arrayPartition,
  arrayReduce,
  arraySort,
  arrayToRecord,
} from '@shared/lib/arrayUtils.shared';
import {noopTrue} from '@shared/lib/utils.shared';

describe('arrayForEach', () => {
  test('should call callback for each element', () => {
    const arr = [1, 2, 3];
    const mockCallback = jest.fn();
    arrayForEach(arr, mockCallback);
    expect(mockCallback).toHaveBeenCalledTimes(3);
    expect(mockCallback).toHaveBeenCalledWith(1, 0, arr);
    expect(mockCallback).toHaveBeenCalledWith(2, 1, arr);
    expect(mockCallback).toHaveBeenCalledWith(3, 2, arr);
  });

  test('should not call callback for an empty array', () => {
    const arr: unknown[] = [];
    const mockCallback = jest.fn();
    arrayForEach(arr, mockCallback);
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('should handle arrays with mixed types', () => {
    const arr = [1, 'a', true, null, undefined, {key: 'value'}];
    const mockCallback = jest.fn();
    arrayForEach(arr, mockCallback);
    expect(mockCallback).toHaveBeenCalledTimes(6);
    expect(mockCallback).toHaveBeenCalledWith(1, 0, arr);
    expect(mockCallback).toHaveBeenCalledWith('a', 1, arr);
    expect(mockCallback).toHaveBeenCalledWith(true, 2, arr);
    expect(mockCallback).toHaveBeenCalledWith(null, 3, arr);
    expect(mockCallback).toHaveBeenCalledWith(undefined, 4, arr);
    expect(mockCallback).toHaveBeenCalledWith({key: 'value'}, 5, arr);
  });
});

describe('arrayFilter', () => {
  test('should filter an array based on a predicate', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = arrayFilter(arr, (value) => value > 3);
    expect(result).toEqual([4, 5]);
  });

  test('should return a new array', () => {
    const arr = [1, 2, 3];
    const result = arrayFilter(arr, () => true);
    expect(result).toEqual(arr);
    expect(result).not.toBe(arr);
  });

  test('should return an empty array if no elements match the predicate', () => {
    const arr = [1, 2, 3];
    const result = arrayFilter(arr, (value) => value > 5);
    expect(result).toEqual([]);
  });

  test('predicate receives correct arguments', () => {
    const arr = ['a', 'b'];
    const mockPredicate = jest.fn(() => true);
    arrayFilter(arr, mockPredicate);
    expect(mockPredicate).toHaveBeenCalledTimes(2);
    expect(mockPredicate).toHaveBeenCalledWith('a', 0, arr);
    expect(mockPredicate).toHaveBeenCalledWith('b', 1, arr);
  });
});

describe('arrayFilterNull', () => {
  test('should remove null values from array', () => {
    expect(arrayFilterNull([1, null, 2, null, 3])).toEqual([1, 2, 3]);
  });

  test('should return empty array if all values are null', () => {
    expect(arrayFilterNull([null, null])).toEqual([]);
  });

  test('should return same array if no null values', () => {
    expect(arrayFilterNull([1, 2, 3])).toEqual([1, 2, 3]);
  });

  test('should handle empty array', () => {
    expect(arrayFilterNull([])).toEqual([]);
  });
});

describe('arrayFilterUndefined', () => {
  test('should remove undefined values from array', () => {
    expect(arrayFilterUndefined([1, undefined, 2, undefined, 3])).toEqual([1, 2, 3]);
  });

  test('should return empty array if all values are undefined', () => {
    expect(arrayFilterUndefined([undefined, undefined])).toEqual([]);
  });

  test('should return same array if no undefined values', () => {
    expect(arrayFilterUndefined([1, 2, 3])).toEqual([1, 2, 3]);
  });

  test('should handle empty array', () => {
    expect(arrayFilterUndefined([])).toEqual([]);
  });
});

describe('arrayMap', () => {
  test('should map an array to a new array of values', () => {
    const arr = [1, 2, 3];
    const result = arrayMap(arr, (value) => String(value));
    expect(result).toEqual(['1', '2', '3']);
  });

  test('should return a new array', () => {
    const arr = [1, 2, 3];
    const result = arrayMap(arr, (value) => value);
    expect(result).toEqual(arr);
    expect(result).not.toBe(arr);
  });

  test('should return an empty array if the input array is empty', () => {
    const arr: number[] = [];
    const result = arrayMap(arr, (value) => value * 2);
    expect(result).toEqual([]);
  });

  test('mapper function receives correct arguments', () => {
    const arr = ['a', 'b'];
    const mockMapper = jest.fn((value) => value);
    arrayMap(arr, mockMapper);
    expect(mockMapper).toHaveBeenCalledTimes(2);
    expect(mockMapper).toHaveBeenCalledWith('a', 0, arr);
    expect(mockMapper).toHaveBeenCalledWith('b', 1, arr);
  });
});

describe('arrayReduce', () => {
  test('should reduce an array to a single value', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = arrayReduce(arr, (acc, value) => acc + value, 0);
    expect(result).toBe(15);
  });

  test('should return the initial value for an empty array', () => {
    const arr: string[] = [];
    const result = arrayReduce(arr, (acc, value) => acc + value, 'initial');
    expect(result).toBe('initial');
  });

  test('should handle reducing to a different type', () => {
    const arr = [1, 2, 3];
    const result = arrayReduce(arr, (acc, value) => [...acc, String(value)], [] as string[]);
    expect(result).toEqual(['1', '2', '3']);
  });

  test('reducer receives correct arguments', () => {
    const arr = [10, 20];
    const mockReducer = jest.fn((acc, value) => acc + value);
    arrayReduce(arr, mockReducer, 0);
    expect(mockReducer).toHaveBeenCalledTimes(2);
    expect(mockReducer).toHaveBeenNthCalledWith(1, 0, 10, 0, arr);
    expect(mockReducer).toHaveBeenNthCalledWith(2, 10, 20, 1, arr);
  });
});

describe('arraySort', () => {
  test('should sort a numeric array correctly', () => {
    const arr = [5, 1, 4, 2, 3];
    const sortedArr = arraySort(arr, (a, b) => a - b);
    expect(sortedArr).toEqual([1, 2, 3, 4, 5]);
  });

  test('should sort a string array correctly', () => {
    const arr = ['banana', 'apple', 'cherry'];
    const sortedArr = arraySort(arr, (a, b) => a.localeCompare(b));
    expect(sortedArr).toEqual(['apple', 'banana', 'cherry']);
  });

  test('should sort the array in-place', () => {
    const arr = [3, 1, 2];
    const result = arraySort(arr, (a, b) => a - b);
    expect(arr).toEqual([1, 2, 3]);
    expect(result).toBe(arr);
  });

  test('should handle an empty array', () => {
    const arr: number[] = [];
    const result = arraySort(arr, (a, b) => a - b);
    expect(result).toEqual([]);
    expect(arr).toEqual([]);
  });
});

describe('arrayToRecord', () => {
  test('should convert an array of objects to a record', () => {
    const arr = [
      {id: 'a', value: 1},
      {id: 'b', value: 2},
    ];
    const result = arrayToRecord(arr, (item) => item.id);
    expect(result).toEqual({
      a: {id: 'a', value: 1},
      b: {id: 'b', value: 2},
    });
  });

  test('should handle an empty array', () => {
    const arr: Array<{id: string}> = [];
    const result = arrayToRecord(arr, (item) => item.id);
    expect(result).toEqual({});
  });

  test('should overwrite earlier items if keys are duplicated', () => {
    const arr = [
      {id: 'a', value: 1},
      {id: 'b', value: 2},
      {id: 'a', value: 3},
    ];
    const result = arrayToRecord(arr, (item) => item.id);
    expect(result).toEqual({
      a: {id: 'a', value: 3},
      b: {id: 'b', value: 2},
    });
  });

  test('should work with numeric keys', () => {
    const arr = [
      {id: 10, name: 'ten'},
      {id: 20, name: 'twenty'},
    ];
    const result = arrayToRecord(arr, (item) => item.id);
    expect(result).toEqual({
      '10': {id: 10, name: 'ten'},
      '20': {id: 20, name: 'twenty'},
    });
  });
});

describe('arrayPartition', () => {
  test('should partition array based on predicate', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const [evens, odds] = arrayPartition(numbers, (n) => n % 2 === 0);
    expect(evens).toEqual([2, 4, 6]);
    expect(odds).toEqual([1, 3, 5]);
  });

  test('should handle empty array', () => {
    const [trueValues, falseValues] = arrayPartition([], noopTrue);
    expect(trueValues).toEqual([]);
    expect(falseValues).toEqual([]);
  });

  test('should handle array with only matching elements', () => {
    const numbers = [2, 4, 6, 8];
    const [evens, odds] = arrayPartition(numbers, (n) => n % 2 === 0);
    expect(evens).toEqual([2, 4, 6, 8]);
    expect(odds).toEqual([]);
  });

  test('should handle array with no matching elements', () => {
    const numbers = [1, 3, 5, 7];
    const [evens, odds] = arrayPartition(numbers, (n) => n % 2 === 0);
    expect(evens).toEqual([]);
    expect(odds).toEqual([1, 3, 5, 7]);
  });

  test('should work with different types', () => {
    const mixed = [1, 'a', 2, 'b', 3];
    const [numbers, strings] = arrayPartition(mixed, (item) => typeof item === 'number');
    expect(numbers).toEqual([1, 2, 3]);
    expect(strings).toEqual(['a', 'b']);
  });
});
