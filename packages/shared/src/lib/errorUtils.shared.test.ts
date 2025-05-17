import {
  asyncTry,
  asyncTryAll,
  asyncTryAllPromises,
  prefixError,
  prefixErrorResult,
  prefixResultIfError,
  syncTry,
  syncTryAll,
  upgradeUnknownError,
} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {expectErrorResult} from '@shared/lib/testUtils.shared';

import type {AsyncResult, Result} from '@shared/types/results.types';

const MOCK_ERROR_MESSAGE = 'Mock error message';

describe('syncTry', () => {
  it('should return success result when function executes successfully', () => {
    const result = syncTry(() => 42);
    expect(result).toEqual(makeSuccessResult(42));
  });

  it('should return success result with undefined when function returns undefined', () => {
    const result = syncTry(() => undefined);
    expect(result).toEqual(makeSuccessResult(undefined));
  });

  it('should preserve the type of successful results', () => {
    interface TestType {
      readonly id: string;
      readonly value: number;
    }

    const testObj: TestType = {
      id: 'test',
      value: 123,
    };

    const result = syncTry(() => testObj);

    expect(result).toEqual(makeSuccessResult(testObj));
  });

  it('should return error result when function throws an Error', () => {
    const result = syncTry(() => {
      // eslint-disable-next-line no-restricted-syntax
      throw new Error(MOCK_ERROR_MESSAGE);
    });

    expectErrorResult(result, MOCK_ERROR_MESSAGE);
  });

  it('should handle non-Error throws by converting them to Error objects', () => {
    const result = syncTry(() => {
      // eslint-disable-next-line no-restricted-syntax
      throw MOCK_ERROR_MESSAGE;
    });

    expectErrorResult(result, MOCK_ERROR_MESSAGE);
  });

  it('should handle throwing undefined', () => {
    const result = syncTry(() => {
      // eslint-disable-next-line no-restricted-syntax
      throw undefined;
    });

    expectErrorResult(result, 'Expected error, but caught `undefined` (undefined)');
  });
});

describe('syncTryAll', () => {
  it('should return success result with all values when all results succeed', () => {
    const results = [makeSuccessResult(1), makeSuccessResult(2), makeSuccessResult(3)];

    const combinedResult = syncTryAll(results);

    expect(combinedResult).toEqual(makeSuccessResult([1, 2, 3]));
  });

  it('should return first error result when any result fails', () => {
    const results = [
      makeSuccessResult(1),
      makeErrorResult(new Error(MOCK_ERROR_MESSAGE)),
      makeSuccessResult(3),
    ];

    const combinedResult = syncTryAll(results);

    expectErrorResult(combinedResult, MOCK_ERROR_MESSAGE);
  });

  it('should handle empty array input', () => {
    const results: Array<Result<unknown>> = [];

    const combinedResult = syncTryAll(results);

    expect(combinedResult).toEqual(makeSuccessResult([]));
  });

  it('should handle various result types', () => {
    const results: Array<Result<unknown>> = [
      makeSuccessResult('string'),
      makeSuccessResult(123),
      makeSuccessResult({id: 'test'}),
    ];

    const combinedResult = syncTryAll(results);

    expect(combinedResult).toEqual(makeSuccessResult(['string', 123, {id: 'test'}]));
  });

  it('should handle errors thrown in partition function', () => {
    // Create a custom Array-like object that will throw when iterated over
    const errorArray = {
      length: 1,
      0: makeSuccessResult(1),
      [Symbol.iterator]: () => {
        // eslint-disable-next-line no-restricted-syntax
        throw new Error(MOCK_ERROR_MESSAGE);
      },
    };

    // Call syncTryAll with the custom array that will throw during execution
    // Using 'unknown' as a type assertion first before asserting as Array to fix TS error
    const combinedResult = syncTryAll(errorArray as unknown as Array<Result<unknown>>);

    expectErrorResult(combinedResult, 'arr.reduce is not a function');
  });
});

describe('asyncTry', () => {
  it('should return success result when async function resolves successfully', async () => {
    const result = await asyncTry(async () => 42);
    expect(result).toEqual(makeSuccessResult(42));
  });

  it('should return success result with undefined when async function resolves with undefined', async () => {
    const result = await asyncTry(async () => undefined);
    expect(result).toEqual(makeSuccessResult(undefined));
  });

  it('should preserve the type of successful results', async () => {
    interface TestType {
      readonly id: string;
      readonly value: number;
    }

    const testObj: TestType = {
      id: 'test',
      value: 123,
    };

    const result = await asyncTry(async () => testObj);

    expect(result).toEqual(makeSuccessResult(testObj));
  });

  it('should return error result when async function rejects with an Error', async () => {
    const result = await asyncTry(async () => {
      // eslint-disable-next-line no-restricted-syntax
      throw new Error(MOCK_ERROR_MESSAGE);
    });

    expectErrorResult(result, MOCK_ERROR_MESSAGE);
  });

  it('should handle non-Error rejections by converting them to Error objects', async () => {
    const result = await asyncTry(async () => {
      // eslint-disable-next-line no-restricted-syntax
      throw MOCK_ERROR_MESSAGE;
    });

    expectErrorResult(result, MOCK_ERROR_MESSAGE);
  });

  it('should handle rejecting with undefined', async () => {
    const result = await asyncTry(async () => {
      // eslint-disable-next-line no-restricted-syntax
      throw undefined;
    });

    expectErrorResult(result, 'Expected error, but caught `undefined` (undefined)');
  });

  it('should handle rejected promises', async () => {
    const result = await asyncTry(async () => {
      return Promise.reject(new Error(MOCK_ERROR_MESSAGE));
    });

    expectErrorResult(result, MOCK_ERROR_MESSAGE);
  });
});

describe('asyncTryAll', () => {
  it('should return success result when all async results succeed', async () => {
    const result = await asyncTryAll([
      asyncTry(async () => 1),
      asyncTry(async () => 'two'),
      asyncTry(async () => ({three: true})),
    ]);

    expect(result).toEqual(
      makeSuccessResult({
        success: true,
        results: [
          {success: true, value: 1},
          {success: true, value: 'two'},
          {success: true, value: {three: true}},
        ],
      })
    );
  });

  it('should handle unexpected errors during execution', async () => {
    const result = await asyncTryAll([
      asyncTry(async () => {
        // eslint-disable-next-line no-restricted-syntax
        throw new Error(MOCK_ERROR_MESSAGE);
      }),
    ]);

    expect(result).toEqual(
      makeSuccessResult({
        success: false,
        results: [{success: false, error: new Error(MOCK_ERROR_MESSAGE)}],
      })
    );
  });

  it('should handle mixed success and failure results', async () => {
    const result = await asyncTryAll([
      asyncTry(async () => 1),
      asyncTry(async () => {
        // eslint-disable-next-line no-restricted-syntax
        throw new Error(MOCK_ERROR_MESSAGE);
      }),
      asyncTry(async () => 3),
    ]);

    expect(result).toEqual(
      makeSuccessResult({
        success: false,
        results: [
          {success: true, value: 1},
          {success: false, error: new Error(MOCK_ERROR_MESSAGE)},
          {success: true, value: 3},
        ],
      })
    );
  });

  it('should handle empty array input', async () => {
    const result = await asyncTryAll([]);

    expect(result).toEqual(
      makeSuccessResult({
        success: true,
        results: [],
      })
    );
  });

  it('should handle errors when Promise.all throws', async () => {
    // Create a Promise rejected with a circular reference that cannot be stringified.
    const circular: Record<string, unknown> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (circular as any).self = circular;

    const mockPromise = Promise.reject(circular);
    const asyncResults = [mockPromise] as unknown as readonly [AsyncResult<unknown>];

    const result = await asyncTryAll(asyncResults);

    expectErrorResult(result, 'Expected error, but caught non-stringifiable object');
  });
});

describe('asyncTryAllPromises', () => {
  it('should return success result when all promises resolve', async () => {
    const result = await asyncTryAllPromises([
      Promise.resolve(1),
      Promise.resolve('two'),
      Promise.resolve({three: true}),
    ]);

    expect(result).toEqual(
      makeSuccessResult({
        success: true,
        results: [
          {success: true, value: 1},
          {success: true, value: 'two'},
          {success: true, value: {three: true}},
        ],
      })
    );
  });

  it('should handle mixed resolved and rejected promises', async () => {
    const result = await asyncTryAllPromises([
      Promise.resolve(1),
      Promise.reject(new Error(MOCK_ERROR_MESSAGE)),
      Promise.resolve(3),
    ]);

    expect(result).toEqual(
      makeSuccessResult({
        success: false,
        results: [
          {success: true, value: 1},
          {success: false, error: new Error(MOCK_ERROR_MESSAGE)},
          {success: true, value: 3},
        ],
      })
    );
  });

  it('should handle non-Error rejections', async () => {
    const result = await asyncTryAllPromises([
      Promise.resolve(1),
      Promise.reject(MOCK_ERROR_MESSAGE),
      Promise.resolve(3),
    ]);

    expect(result).toEqual(
      makeSuccessResult({
        success: false,
        results: [
          {success: true, value: 1},
          {success: false, error: new Error(MOCK_ERROR_MESSAGE)},
          {success: true, value: 3},
        ],
      })
    );
  });

  it('should handle empty array input', async () => {
    const result = await asyncTryAllPromises([]);

    expect(result).toEqual(
      makeSuccessResult({
        success: true,
        results: [],
      })
    );
  });

  it('should handle rejecting with undefined', async () => {
    const result = await asyncTryAllPromises([
      Promise.resolve(1),
      Promise.reject(undefined),
      Promise.resolve(3),
    ]);

    expect(result).toEqual(
      makeSuccessResult({
        success: false,
        results: [
          {success: true, value: 1},
          {success: false, error: new Error('Expected error, but caught `undefined` (undefined)')},
          {success: true, value: 3},
        ],
      })
    );
  });

  it('should handle errors thrown during Promise.allSettled', async () => {
    const result = await asyncTryAllPromises([
      Promise.reject(new Error('Promise.allSettled rejection')),
    ]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.success).toBe(false);
      expectErrorResult(result.value.results[0], 'Promise.allSettled rejection');
    }
  });

  it('should handle errors when Promise.allSettled throws', async () => {
    const nonIterable = 42;
    const result = await asyncTryAllPromises(nonIterable as unknown as readonly [Promise<unknown>]);

    expectErrorResult(result, 'number 42 is not iterable');
  });
});

describe('upgradeUnknownError', () => {
  it('should handle Error objects', () => {
    const originalError = new Error(MOCK_ERROR_MESSAGE);
    const upgradedError = upgradeUnknownError(originalError);

    expect(upgradedError.message).toBe(MOCK_ERROR_MESSAGE);
    expect(upgradedError.cause).toBe(originalError);
  });

  it('should handle string errors', () => {
    const upgradedError = upgradeUnknownError(MOCK_ERROR_MESSAGE);

    expect(upgradedError.message).toBe(MOCK_ERROR_MESSAGE);
    expect(upgradedError.cause).toBe(MOCK_ERROR_MESSAGE);
  });

  it('should handle Error objects with empty messages', () => {
    const originalError = new Error();
    const upgradedError = upgradeUnknownError(originalError);

    expect(upgradedError.message).toBe('An unexpected error occurred');
    expect(upgradedError.cause).toBe(originalError);
  });

  it('should handle objects with message property', () => {
    const errorObj = {message: MOCK_ERROR_MESSAGE};
    const upgradedError = upgradeUnknownError(errorObj);

    expect(upgradedError.message).toBe(MOCK_ERROR_MESSAGE);
    expect(upgradedError.cause).toBe(MOCK_ERROR_MESSAGE);
  });

  it('should handle objects with error property', () => {
    const errorObj = {error: MOCK_ERROR_MESSAGE};
    const upgradedError = upgradeUnknownError(errorObj);

    expect(upgradedError.message).toBe(MOCK_ERROR_MESSAGE);
    expect(upgradedError.cause).toBe(MOCK_ERROR_MESSAGE);
  });

  it('should handle nested error objects', () => {
    const errorObj = {error: {message: MOCK_ERROR_MESSAGE}};
    const upgradedError = upgradeUnknownError(errorObj);

    expect(upgradedError.message).toBe(MOCK_ERROR_MESSAGE);
    expect(upgradedError.cause).toBe(MOCK_ERROR_MESSAGE);
  });

  it('should handle Error objects with cause', () => {
    const causeError = new Error(MOCK_ERROR_MESSAGE);
    const originalError = new Error(MOCK_ERROR_MESSAGE, {cause: causeError});
    const upgradedError = upgradeUnknownError(originalError);

    expect(upgradedError.message).toBe(MOCK_ERROR_MESSAGE);
    expect(upgradedError.cause).toBe(causeError);
  });

  it('should handle objects with no message or error property', () => {
    const unknownObj = {foo: 'bar'};
    const upgradedError = upgradeUnknownError(unknownObj);

    expect(upgradedError.message).toBe('Expected error, but caught `{"foo":"bar"}` (object)');
    expect(upgradedError.cause).toBe(unknownObj);
  });
});

describe('prefixError', () => {
  it('should add prefix to error message', () => {
    const originalError = new Error(MOCK_ERROR_MESSAGE);
    const prefix = 'Error prefix';
    const prefixedError = prefixError(originalError, prefix);

    expect(prefixedError.message).toBe(`${prefix}: ${MOCK_ERROR_MESSAGE}`);
    expect(prefixedError.cause).toBe(originalError);
  });

  it('should handle errors with cause', () => {
    const causeError = new Error(MOCK_ERROR_MESSAGE);
    const originalError = new Error(MOCK_ERROR_MESSAGE, {cause: causeError});
    const prefix = 'Error prefix';
    const prefixedError = prefixError(originalError, prefix);

    expect(prefixedError.message).toBe(`${prefix}: ${MOCK_ERROR_MESSAGE}`);
    expect(prefixedError.cause).toBe(causeError);
  });
});

describe('prefixErrorResult', () => {
  it('should add prefix to error message in ErrorResult', () => {
    const errorResult = makeErrorResult(new Error(MOCK_ERROR_MESSAGE));
    const prefix = 'Prefix';

    const prefixedResult = prefixErrorResult(errorResult, prefix);

    expectErrorResult(prefixedResult, `${prefix}: ${MOCK_ERROR_MESSAGE}`);
  });
});

describe('prefixResultIfError', () => {
  it('should return original SuccessResult unchanged', () => {
    const successResult = makeSuccessResult(42);
    const prefix = 'Prefix';

    const result = prefixResultIfError(successResult, prefix);

    expect(result).toBe(successResult);
  });

  it('should add prefix to error message for ErrorResult', () => {
    const errorResult = makeErrorResult(new Error(MOCK_ERROR_MESSAGE));
    const prefix = 'Prefix';

    const result = prefixResultIfError(errorResult, prefix);

    expectErrorResult(result, `${prefix}: ${MOCK_ERROR_MESSAGE}`);
  });
});
