import {
  objectEntries,
  objectFilterEntries,
  objectFilterKeys,
  objectFilterValues,
  objectForEachEntry,
  objectForEachKey,
  objectForEachValue,
  objectKeys,
  objectMapEntries,
  objectMapKeys,
  objectMapValues,
  objectOmitUndefined,
  objectReduceValues,
  objectSize,
  objectValues,
} from '@shared/lib/objectUtils.shared';

describe('objectOmitUndefined', () => {
  test('should remove properties with undefined values', () => {
    const obj = {
      a: 1,
      b: undefined,
      c: 'test',
      d: undefined,
    };
    expect(objectOmitUndefined(obj)).toEqual({
      a: 1,
      c: 'test',
    });
  });

  test('should return same object if no undefined values', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 'test',
    };
    expect(objectOmitUndefined(obj)).toEqual(obj);
  });

  test('should return empty object if all values are undefined', () => {
    const obj = {
      a: undefined,
      b: undefined,
    };
    expect(objectOmitUndefined(obj)).toEqual({});
  });

  test('should handle empty object', () => {
    expect(objectOmitUndefined({})).toEqual({});
  });

  test('should handle null values (preserving them)', () => {
    const obj = {
      a: 1,
      b: null,
      c: undefined,
    };
    expect(objectOmitUndefined(obj)).toEqual({
      a: 1,
      b: null,
    });
  });
});

describe('objectSize', () => {
  test('should return zero for an empty object', () => {
    const obj = {};
    expect(objectSize(obj)).toEqual(0);
  });

  test('should return the size of the object', () => {
    const obj = {a: 1, b: 'two', c: true};
    expect(objectSize(obj)).toEqual(3);
  });

  test('should handle mixed keys and values', () => {
    const obj = {1: 'one', 2: null, 3: undefined, a: 1, b: ['two', 8], c: true};
    expect(objectSize(obj)).toEqual(6);
  });
});

describe('objectKeys', () => {
  test('should return an array of keys', () => {
    const obj = {a: 1, b: 'two', c: true};
    expect(objectKeys(obj)).toEqual(['a', 'b', 'c']);
  });

  test('should return an empty array for an empty object', () => {
    const obj = {};
    expect(objectKeys(obj)).toEqual([]);
  });

  test('should handle numeric keys', () => {
    const obj = {1: 'one', 2: 'two'};
    expect(objectKeys(obj)).toEqual(['1', '2']);
  });
});

describe('objectValues', () => {
  test('should return an array of values', () => {
    const obj = {a: 1, b: 'two', c: true};
    expect(objectValues(obj)).toEqual([1, 'two', true]);
  });

  test('should return an empty array for an empty object', () => {
    const obj = {};
    expect(objectValues(obj)).toEqual([]);
  });

  test('should handle objects with undefined and null values', () => {
    const obj = {a: undefined, b: null, c: 0};
    expect(objectValues(obj)).toEqual([undefined, null, 0]);
  });
});

describe('objectEntries', () => {
  test('should return an array of [key, value] pairs', () => {
    const obj = {a: 1, b: 'two', c: true};
    expect(objectEntries(obj)).toEqual([
      ['a', 1],
      ['b', 'two'],
      ['c', true],
    ]);
  });

  test('should return an empty array for an empty object', () => {
    const obj = {};
    expect(objectEntries(obj)).toEqual([]);
  });

  test('should handle numeric keys', () => {
    const obj = {1: 'one', 2: 'two'};
    expect(objectEntries(obj)).toEqual([
      ['1', 'one'],
      ['2', 'two'],
    ]);
  });
});

describe('objectForEachKey', () => {
  test('should call callback for each key', () => {
    const obj = {a: 1, b: 2};
    const mockCallback = jest.fn();
    objectForEachKey(obj, mockCallback);
    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenCalledWith('a', 0, ['a', 'b']);
    expect(mockCallback).toHaveBeenCalledWith('b', 1, ['a', 'b']);
  });

  test('should not call callback for empty object', () => {
    const obj = {};
    const mockCallback = jest.fn();
    objectForEachKey(obj, mockCallback);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe('objectForEachValue', () => {
  test('should call callback for each value', () => {
    const obj = {a: 1, b: 'two'};
    const mockCallback = jest.fn();
    objectForEachValue(obj, mockCallback);
    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenCalledWith(1, 0, [1, 'two']);
    expect(mockCallback).toHaveBeenCalledWith('two', 1, [1, 'two']);
  });

  test('should not call callback for empty object', () => {
    const obj = {};
    const mockCallback = jest.fn();
    objectForEachValue(obj, mockCallback);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe('objectForEachEntry', () => {
  test('should call callback for each key-value pair', () => {
    const obj = {a: 1, b: 'two'};
    const mockCallback = jest.fn();
    objectForEachEntry(obj, mockCallback);
    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenCalledWith('a', 1, 0, [
      ['a', 1],
      ['b', 'two'],
    ]);
    expect(mockCallback).toHaveBeenCalledWith('b', 'two', 1, [
      ['a', 1],
      ['b', 'two'],
    ]);
  });

  test('should not call callback for empty object', () => {
    const obj = {};
    const mockCallback = jest.fn();
    objectForEachEntry(obj, mockCallback);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe('objectFilterKeys', () => {
  test('should filter based on keys', () => {
    const obj = {a: 1, b: 2, c: 3};
    const result = objectFilterKeys(obj, (key) => key !== 'b');
    expect(result).toEqual({a: 1, c: 3});
  });

  test('should return an empty object if no keys match', () => {
    const obj = {a: 1, b: 2};
    const result = objectFilterKeys(obj, () => false);
    expect(result).toEqual({});
  });
});

describe('objectFilterValues', () => {
  test('should filter based on values', () => {
    const obj = {a: 1, b: 2, c: 3};
    const result = objectFilterValues(obj, (value) => value > 1);
    expect(result).toEqual({b: 2, c: 3});
  });

  test('should return an empty object if no values match', () => {
    const obj = {a: 1, b: 2};
    const result = objectFilterValues(obj, (value) => value > 5);
    expect(result).toEqual({});
  });
});

describe('objectFilterEntries', () => {
  test('should filter based on entries', () => {
    const obj = {a: 1, b: 2, c: 3};
    const result = objectFilterEntries(obj, (key, value) => key === 'a' || value === 3);
    expect(result).toEqual({a: 1, c: 3});
  });

  test('should return an empty object if no entries match', () => {
    const obj = {a: 1, b: 2};
    const result = objectFilterEntries(obj, () => false);
    expect(result).toEqual({});
  });
});

describe('objectMapKeys', () => {
  test('should map keys correctly', () => {
    const obj: Record<string, number> = {a: 1, b: 2};
    const result = objectMapKeys(obj, (key) => key.toUpperCase());
    expect(result).toEqual({A: 1, B: 2});
  });

  test('should return an empty object for an empty object', () => {
    const obj: Record<string, number> = {};
    const result = objectMapKeys(obj, (key) => key.toUpperCase());
    expect(result).toEqual({});
  });

  test('should handle numeric keys', () => {
    const obj = {'1': 'one', '2': 'two'};
    const result = objectMapKeys(obj, (key) => `key_${key}`);
    expect(result).toEqual({key_1: 'one', key_2: 'two'});
  });
});

describe('objectMapValues', () => {
  test('should map values correctly', () => {
    const obj = {a: 1, b: 2};
    const result = objectMapValues(obj, (value) => value * 2);
    expect(result).toEqual({a: 2, b: 4});
  });

  test('should return an empty object for an empty object', () => {
    const obj = {};
    const result = objectMapValues(obj, (value) => value);
    expect(result).toEqual({});
  });

  test('should handle different value types', () => {
    const obj = {a: 1, b: 'two', c: true};
    const result = objectMapValues(obj, (value) => String(value));
    expect(result).toEqual({a: '1', b: 'two', c: 'true'});
  });

  test('should not filter if no filter function is provided', () => {
    const obj = {a: 1, b: 2};
    const result = objectMapValues(obj, (value) => value + 1);
    expect(result).toEqual({a: 2, b: 3});
  });
});

describe('objectMapEntries', () => {
  test('should map entries to an array', () => {
    const obj = {a: 1, b: 2};
    const result = objectMapEntries(obj, (key, value) => `${key}:${value}`);
    expect(result).toEqual(['a:1', 'b:2']);
  });

  test('should return an empty array for an empty object', () => {
    const obj = {};
    const result = objectMapEntries(obj, (key, value) => `${key}:${value}`);
    expect(result).toEqual([]);
  });

  test('mapper should receive correct key and value', () => {
    const obj = {a: 1};
    const mockMapper = jest.fn();
    objectMapEntries(obj, mockMapper);
    expect(mockMapper).toHaveBeenCalledWith('a', 1);
  });

  test('should handle different value types', () => {
    const obj = {a: 1, b: 'two', c: true};
    const result = objectMapEntries(obj, (key, value) => ({key, value}));
    expect(result).toEqual([
      {key: 'a', value: 1},
      {key: 'b', value: 'two'},
      {key: 'c', value: true},
    ]);
  });
});

describe('objectReduceValues', () => {
  test('should reduce numeric values to a single sum', () => {
    const obj = {a: 1, b: 2, c: 3};
    const result = objectReduceValues(obj, (acc, value) => acc + value, 0);
    expect(result).toBe(6);
  });

  test('should concatenate string values', () => {
    const obj = {a: 'hello', b: ' ', c: 'world'};
    const result = objectReduceValues(obj, (acc, value) => acc + value, '');
    expect(result).toBe('hello world');
  });

  test('should return the initial value for an empty object', () => {
    const obj = {};
    const result = objectReduceValues(obj, (acc, value) => acc + value, 100);
    expect(result).toBe(100);
  });

  test('should handle reducing to a different type', () => {
    const obj = {a: 1, b: 2, c: 3};
    const result = objectReduceValues(obj, (acc, value) => acc + String(value), '');
    expect(result).toBe('123');
  });

  test('reducer should receive correct parameters', () => {
    const obj = {a: 10, b: 20};
    const values = objectValues(obj);
    const mockReducer = jest.fn((acc, val) => acc + val);

    objectReduceValues(obj, mockReducer, 0);

    expect(mockReducer).toHaveBeenCalledTimes(2);
    expect(mockReducer).toHaveBeenNthCalledWith(1, 0, 10, 0, values);
    expect(mockReducer).toHaveBeenNthCalledWith(2, 10, 20, 1, values);
  });
});
