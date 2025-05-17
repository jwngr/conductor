import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {expectErrorResult, expectSuccessResult} from '@shared/lib/testUtils.shared';
import {
  assertNever,
  batchAsyncResults,
  batchSyncResults,
  filterNull,
  filterUndefined,
  formatWithCommas,
  isDate,
  isValidEmail,
  makeUuid,
  noopTrue,
  omitUndefined,
  partition,
  pluralize,
  pluralizeWithCount,
} from '@shared/lib/utils.shared';

import type {Result} from '@shared/types/results.types';

describe('formatWithCommas', () => {
  test('should format numbers with commas', () => {
    expect(formatWithCommas(1000)).toBe('1,000');
    expect(formatWithCommas(1000000)).toBe('1,000,000');
    expect(formatWithCommas(1234567)).toBe('1,234,567');
  });

  test('should handle small numbers without commas', () => {
    expect(formatWithCommas(0)).toBe('0');
    expect(formatWithCommas(1)).toBe('1');
    expect(formatWithCommas(999)).toBe('999');
  });

  test('should handle decimal numbers correctly', () => {
    expect(formatWithCommas(1000.5)).toBe('1,000.5');
    expect(formatWithCommas(1234567.89)).toBe('1,234,567.89');
  });
});

describe('filterNull', () => {
  test('should remove null values from array', () => {
    expect(filterNull([1, null, 2, null, 3])).toEqual([1, 2, 3]);
  });

  test('should return empty array if all values are null', () => {
    expect(filterNull([null, null])).toEqual([]);
  });

  test('should return same array if no null values', () => {
    expect(filterNull([1, 2, 3])).toEqual([1, 2, 3]);
  });

  test('should handle empty array', () => {
    expect(filterNull([])).toEqual([]);
  });
});

describe('filterUndefined', () => {
  test('should remove undefined values from array', () => {
    expect(filterUndefined([1, undefined, 2, undefined, 3])).toEqual([1, 2, 3]);
  });

  test('should return empty array if all values are undefined', () => {
    expect(filterUndefined([undefined, undefined])).toEqual([]);
  });

  test('should return same array if no undefined values', () => {
    expect(filterUndefined([1, 2, 3])).toEqual([1, 2, 3]);
  });

  test('should handle empty array', () => {
    expect(filterUndefined([])).toEqual([]);
  });
});

describe('isValidEmail', () => {
  test('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  test('should return false for invalid email addresses', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('no@domain.')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('should return false for non-string values', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
    expect(isValidEmail({})).toBe(false);
    expect(isValidEmail([])).toBe(false);
  });
});

describe('omitUndefined', () => {
  test('should remove properties with undefined values', () => {
    const obj = {
      a: 1,
      b: undefined,
      c: 'test',
      d: undefined,
    };
    expect(omitUndefined(obj)).toEqual({
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
    expect(omitUndefined(obj)).toEqual(obj);
  });

  test('should return empty object if all values are undefined', () => {
    const obj = {
      a: undefined,
      b: undefined,
    };
    expect(omitUndefined(obj)).toEqual({});
  });

  test('should handle empty object', () => {
    expect(omitUndefined({})).toEqual({});
  });

  test('should handle null values (preserving them)', () => {
    const obj = {
      a: 1,
      b: null,
      c: undefined,
    };
    expect(omitUndefined(obj)).toEqual({
      a: 1,
      b: null,
    });
  });
});

describe('partition', () => {
  test('should partition array based on predicate', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const [evens, odds] = partition(numbers, (n) => n % 2 === 0);
    expect(evens).toEqual([2, 4, 6]);
    expect(odds).toEqual([1, 3, 5]);
  });

  test('should handle empty array', () => {
    const [trueValues, falseValues] = partition([], noopTrue);
    expect(trueValues).toEqual([]);
    expect(falseValues).toEqual([]);
  });

  test('should handle array with only matching elements', () => {
    const numbers = [2, 4, 6, 8];
    const [evens, odds] = partition(numbers, (n) => n % 2 === 0);
    expect(evens).toEqual([2, 4, 6, 8]);
    expect(odds).toEqual([]);
  });

  test('should handle array with no matching elements', () => {
    const numbers = [1, 3, 5, 7];
    const [evens, odds] = partition(numbers, (n) => n % 2 === 0);
    expect(evens).toEqual([]);
    expect(odds).toEqual([1, 3, 5, 7]);
  });

  test('should work with different types', () => {
    const mixed = [1, 'a', 2, 'b', 3];
    const [numbers, strings] = partition(mixed, (item) => typeof item === 'number');
    expect(numbers).toEqual([1, 2, 3]);
    expect(strings).toEqual(['a', 'b']);
  });
});

describe('isDate', () => {
  test('should return true for Date objects', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate(new Date('2023-01-01'))).toBe(true);
  });

  test('should return false for non-Date objects', () => {
    expect(isDate(null)).toBe(false);
    expect(isDate(undefined)).toBe(false);
    expect(isDate('2023-01-01')).toBe(false);
    expect(isDate(123)).toBe(false);
    expect(isDate({})).toBe(false);
    expect(isDate([])).toBe(false);
    expect(isDate(true)).toBe(false);
  });

  test('should return false for Date-like objects that are not actual Date instances', () => {
    const dateLike = {
      getTime: () => 1672531200000,
      toISOString: () => '2023-01-01T00:00:00.000Z',
    };
    expect(isDate(dateLike)).toBe(false);
  });
});

describe('assertNever', () => {
  test('should throw an error when called', () => {
    // TypeScript would normally prevent us from calling this with a non-never type
    // but for testing purposes we can cast to any and then to never
    expect(() => {
      assertNever('not never' as never, {testNoLog: true});
    }).toThrow();

    expect(() => {
      assertNever(123 as never, {testNoLog: true});
    }).toThrow();
  });
});

describe('makeUuid', () => {
  test('should generate a valid UUID string', () => {
    const uuid = makeUuid();
    // UUID format: 8-4-4-4-12 characters with hyphens
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(typeof uuid).toBe('string');
    expect(uuid).toMatch(uuidPattern);
  });

  test('should generate unique UUIDs', () => {
    const uuids = new Set();
    for (let i = 0; i < 100; i++) {
      uuids.add(makeUuid());
    }
    expect(uuids.size).toBe(100);
  });
});

describe('pluralize', () => {
  test('should return singular form when count is 1', () => {
    expect(pluralize(1, 'item')).toBe('item');
    expect(pluralize(1, 'class')).toBe('class');
  });

  test('should return plural form when count is not 1', () => {
    expect(pluralize(0, 'item')).toBe('items');
    expect(pluralize(2, 'item')).toBe('items');
  });

  test('should handle words ending with "s" by adding "es"', () => {
    expect(pluralize(0, 'class')).toBe('classes');
    expect(pluralize(2, 'bus')).toBe('buses');
    expect(pluralize(0, 'pass')).toBe('passes');
  });

  test('should use provided plural form when available', () => {
    expect(pluralize(1, 'person', 'people')).toBe('person');
    expect(pluralize(2, 'person', 'people')).toBe('people');
    expect(pluralize(0, 'child', 'children')).toBe('children');
  });
});

describe('pluralizeWithCount', () => {
  test('should return singular form with count when count is 1', () => {
    expect(pluralizeWithCount(1, 'item')).toBe('1 item');
    expect(pluralizeWithCount(1, 'class')).toBe('1 class');
  });

  test('should return plural form with count when count is not 1', () => {
    expect(pluralizeWithCount(0, 'item')).toBe('0 items');
    expect(pluralizeWithCount(2, 'item')).toBe('2 items');
  });

  test('should handle words ending with "s" by adding "es"', () => {
    expect(pluralizeWithCount(0, 'class')).toBe('0 classes');
    expect(pluralizeWithCount(2, 'bus')).toBe('2 buses');
    expect(pluralizeWithCount(0, 'pass')).toBe('0 passes');
  });

  test('should use provided plural form when available', () => {
    expect(pluralizeWithCount(1, 'person', 'people')).toBe('1 person');
    expect(pluralizeWithCount(2, 'person', 'people')).toBe('2 people');
    expect(pluralizeWithCount(0, 'child', 'children')).toBe('0 children');
  });

  test('should format numbers with commas for large values', () => {
    expect(pluralizeWithCount(1000, 'item')).toBe('1,000 items');
    expect(pluralizeWithCount(1000000, 'download')).toBe('1,000,000 downloads');
  });
});

describe('batchSyncResults', () => {
  test('should run tasks in batches', () => {
    const tasks = [
      () => makeSuccessResult(1),
      () => makeSuccessResult(2),
      () => makeSuccessResult(3),
      () => makeSuccessResult(4),
      () => makeSuccessResult(5),
    ];

    const result = batchSyncResults(tasks, 2);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.length).toBe(5);
      result.value.forEach((res: Result<number>, i: number) => {
        expectSuccessResult(res, i + 1);
      });
    }
  });

  test('should handle empty tasks array', () => {
    const result = batchSyncResults([], 2);
    expectSuccessResult(result, []);
  });

  test('should handle errors in tasks', () => {
    const error = new Error('Test error');
    const tasks = [
      () => makeSuccessResult(1),
      () => makeErrorResult(error),
      () => makeSuccessResult(3),
    ];

    const result = batchSyncResults(tasks, 2);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.length).toBe(3);
      expectSuccessResult(result.value[0], 1);
      expectErrorResult(result.value[1], error.message);
      expectSuccessResult(result.value[2], 3);
    }
  });

  test('should return error for invalid batch size', () => {
    const tasks = [() => makeSuccessResult(1)];

    const result = batchSyncResults(tasks, 0);
    expectErrorResult(result, 'Batch size must be');

    const result2 = batchSyncResults(tasks, -1);
    expectErrorResult(result2, 'Batch size must be');
  });
});

describe('batchAsyncResults', () => {
  test('should run async tasks in batches', async () => {
    const tasks = [
      async () => makeSuccessResult(1),
      async () => makeSuccessResult(2),
      async () => makeSuccessResult(3),
      async () => makeSuccessResult(4),
      async () => makeSuccessResult(5),
    ];

    const result = await batchAsyncResults(tasks, 2);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.length).toBe(5);
      result.value.forEach((res: Result<number>, i: number) => {
        expectSuccessResult(res, i + 1);
      });
    }
  });

  test('should handle empty tasks array', async () => {
    const result = await batchAsyncResults([], 2);
    expectSuccessResult(result, []);
  });

  test('should handle errors in async tasks', async () => {
    const error = new Error('Test error');
    const tasks = [
      async () => makeSuccessResult(1),
      async () => makeErrorResult(error),
      async () => makeSuccessResult(3),
    ];

    const result = await batchAsyncResults(tasks, 2);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.length).toBe(3);
      expectSuccessResult(result.value[0], 1);
      expectErrorResult(result.value[1], error.message);
      expectSuccessResult(result.value[2], 3);
    }
  });

  test('should return error for invalid batch size', async () => {
    const tasks = [async () => makeSuccessResult(1)];

    const result = await batchAsyncResults(tasks, 0);
    expectErrorResult(result, 'Batch size must be');

    const result2 = await batchAsyncResults(tasks, -1);
    expectErrorResult(result2, 'Batch size must be');
  });
});
