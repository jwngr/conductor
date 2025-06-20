import {
  objectEntries,
  objectForEachEntry,
  objectForEachKey,
  objectForEachValue,
  objectKeys,
  objectOmitUndefined,
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

describe('objectKeys', () => {
  test('should return an array of keys', () => {
    const obj: Record<string, unknown> = {a: 1, b: 'two', c: true};
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
    const obj: Record<string, unknown> = {a: 1, b: 'two', c: true};
    expect(objectValues(obj)).toEqual([1, 'two', true]);
  });

  test('should return an empty array for an empty object', () => {
    const obj = {};
    expect(objectValues(obj)).toEqual([]);
  });

  test('should handle objects with undefined and null values', () => {
    const obj: Record<string, unknown> = {a: undefined, b: null, c: 0};
    expect(objectValues(obj)).toEqual([undefined, null, 0]);
  });
});

describe('objectEntries', () => {
  test('should return an array of [key, value] pairs', () => {
    const obj: Record<string, unknown> = {a: 1, b: 'two', c: true};
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
    const obj: Record<string, unknown> = {a: 1, b: 'two'};
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
    const obj: Record<string, unknown> = {a: 1, b: 'two'};
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
