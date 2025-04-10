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

import type {AsyncResult, Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

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

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(MOCK_ERROR_MESSAGE);
    }
  });

  it('should handle non-Error throws by converting them to Error objects', () => {
    const result = syncTry(() => {
      // eslint-disable-next-line no-restricted-syntax
      throw MOCK_ERROR_MESSAGE;
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(MOCK_ERROR_MESSAGE);
    }
  });

  it('should handle throwing undefined', () => {
    const result = syncTry(() => {
      // eslint-disable-next-line no-restricted-syntax
      throw undefined;
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Expected error, but caught `undefined` (undefined)');
    }
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

    expect(combinedResult.success).toBe(false);
    if (!combinedResult.success) {
      expect(combinedResult.error.message).toBe(MOCK_ERROR_MESSAGE);
    }
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

    // Verify it returned an error result
    expect(combinedResult.success).toBe(false);
    if (!combinedResult.success) {
      // The actual error is about arr.reduce not being a function
      expect(combinedResult.error.message).toBe('arr.reduce is not a function');
    }
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

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(MOCK_ERROR_MESSAGE);
    }
  });

  it('should handle non-Error rejections by converting them to Error objects', async () => {
    const result = await asyncTry(async () => {
      // eslint-disable-next-line no-restricted-syntax
      throw MOCK_ERROR_MESSAGE;
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(MOCK_ERROR_MESSAGE);
    }
  });

  it('should handle rejecting with undefined', async () => {
    const result = await asyncTry(async () => {
      // eslint-disable-next-line no-restricted-syntax
      throw undefined;
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Expected error, but caught `undefined` (undefined)');
    }
  });

  it('should handle rejected promises', async () => {
    const result = await asyncTry(async () => {
      return Promise.reject(new Error(MOCK_ERROR_MESSAGE));
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(MOCK_ERROR_MESSAGE);
    }
  });
});

describe('asyncTryAll', () => {
  it('should return success result when all async results succeed', async () => {
    const asyncResults = [
      asyncTry(async () => 1),
      asyncTry(async () => 2),
      asyncTry(async () => 3),
    ] as const;

    const result = await asyncTryAll(asyncResults);

    expect(result).toEqual(
      makeSuccessResult({
        success: true,
        results: [
          {success: true, value: 1},
          {success: true, value: 2},
          {success: true, value: 3},
        ],
      })
    );
  });

  it('should handle mixed success and failure results', async () => {
    const asyncResults = [
      asyncTry(async () => 1),
      asyncTry(async () => {
        // eslint-disable-next-line no-restricted-syntax
        throw new Error(MOCK_ERROR_MESSAGE);
      }),
      asyncTry(async () => 3),
    ] as const;

    const result = await asyncTryAll(asyncResults);

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

  it('should handle unexpected errors during execution', async () => {
    const asyncResults = [
      asyncTry(async () => {
        // eslint-disable-next-line no-restricted-syntax
        throw new Error(MOCK_ERROR_MESSAGE);
      }),
    ] as const;

    const result = await asyncTryAll(asyncResults);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(MOCK_ERROR_MESSAGE);
    }
  });

  it('should handle empty array input', async () => {
    const asyncResults = [] as const;

    const result = await asyncTryAll(asyncResults);

    expect(result).toEqual(
      makeSuccessResult({
        success: true,
        results: [],
      })
    );
  });

  it('should preserve types of successful results', async () => {
    interface TestType {
      readonly id: string;
      readonly value: number;
    }

    const testObj1: TestType = {
      id: 'test1',
      value: 123,
    };

    const testObj2: TestType = {
      id: 'test2',
      value: 456,
    };

    const asyncResults = [asyncTry(async () => testObj1), asyncTry(async () => testObj2)] as const;

    const result = await asyncTryAll(asyncResults);

    expect(result).toEqual(
      makeSuccessResult({
        success: true,
        results: [
          {success: true, value: testObj1},
          {success: true, value: testObj2},
        ],
      })
    );
  });

  it('should handle errors thrown during Promise.all', async () => {
    // Create a Promise that will be rejected
    const mockPromise = Promise.reject(new Error('Promise rejection during execution'));

    // Cast to AsyncResult to match the function signature
    const asyncResults = [mockPromise] as unknown as readonly [AsyncResult<unknown>];

    const result = await asyncTryAll(asyncResults);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Promise rejection during execution');
    }
  });

  // This test specifically covers line 109-110
  it('should handle errors when Promise.all throws', async () => {
    // Create a Promise that will be rejected - using a circular reference that can't be stringified
    const circular: Record<string, unknown> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (circular as any).self = circular; // Create a circular reference

    const mockPromise = Promise.reject(circular);
    const asyncResults = [mockPromise] as unknown as readonly [AsyncResult<unknown>];

    const result = await asyncTryAll(asyncResults);

    expect(result.success).toBe(false);
  });
});

describe('asyncTryAllPromises', () => {
  it('should return success result when all promises resolve', async () => {
    const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)] as const;

    const result = await asyncTryAllPromises(promises);

    expect(result).toEqual(
      makeSuccessResult({
        success: true,
        results: [
          {success: true, value: 1},
          {success: true, value: 2},
          {success: true, value: 3},
        ],
      })
    );
  });

  it('should handle mixed resolved and rejected promises', async () => {
    const promises = [
      Promise.resolve(1),
      Promise.reject(new Error(MOCK_ERROR_MESSAGE)),
      Promise.resolve(3),
    ] as const;

    const result = await asyncTryAllPromises(promises);

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

  it('should preserve types of resolved promises', async () => {
    interface TestType {
      readonly id: string;
      readonly value: number;
    }

    const testObj1: TestType = {
      id: 'test1',
      value: 123,
    };

    const testObj2: TestType = {
      id: 'test2',
      value: 456,
    };

    const promises = [Promise.resolve(testObj1), Promise.resolve(testObj2)] as const;

    const result = await asyncTryAllPromises(promises);

    expect(result).toEqual(
      makeSuccessResult({
        success: true,
        results: [
          {success: true, value: testObj1},
          {success: true, value: testObj2},
        ],
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
    // Create a Promise that throws during execution.

    const result = await asyncTryAllPromises([
      Promise.reject(new Error('Promise.allSettled rejection')),
    ]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.success).toBe(false);
      expect(result.value.results[0].success).toBe(false);
      if (!result.value.results[0].success) {
        expect(result.value.results[0].error.message).toBe('Promise.allSettled rejection');
      }
    }
  });

  // This test specifically covers line 193-194
  it('should handle errors when Promise.allSettled throws', async () => {
    const nonIterable = 42;
    const result = await asyncTryAllPromises(nonIterable as unknown as readonly [Promise<unknown>]);

    // Verify we got an error result
    expect(result.success).toBe(false);
    if (!result.success) {
      // Use the actual error message we're getting
      expect(result.error.message).toContain('number 42 is not iterable');
    }
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

    // The function actually recursively calls itself with the message value
    expect(upgradedError.message).toBe(MOCK_ERROR_MESSAGE);
    expect(upgradedError.cause).toBe(MOCK_ERROR_MESSAGE);
  });

  it('should handle objects with error property', () => {
    const errorObj = {error: MOCK_ERROR_MESSAGE};
    const upgradedError = upgradeUnknownError(errorObj);

    // The function actually recursively calls itself with the error value
    expect(upgradedError.message).toBe(MOCK_ERROR_MESSAGE);
    expect(upgradedError.cause).toBe(MOCK_ERROR_MESSAGE);
  });

  it('should handle nested error objects', () => {
    const errorObj = {error: {message: MOCK_ERROR_MESSAGE}};
    const upgradedError = upgradeUnknownError(errorObj);

    // The function follows the error.message path recursively
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

    expect(prefixedResult.success).toBe(false);
    expect(prefixedResult.error.message).toBe(`${prefix}: ${MOCK_ERROR_MESSAGE}`);
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

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(`${prefix}: ${MOCK_ERROR_MESSAGE}`);
    }
  });
});
