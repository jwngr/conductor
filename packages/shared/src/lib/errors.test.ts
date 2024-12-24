/// <reference types="jest" />

import {asyncTry, asyncTryAll, asyncTryAllPromises, syncTry} from '@shared/lib/errors';

import type {AsyncResult} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';

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
    const errorMessage = 'Test error';
    const result = syncTry(() => {
      throw new Error(errorMessage);
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(errorMessage);
    }
  });

  it('should handle non-Error throws by converting them to Error objects', () => {
    const result = syncTry(() => {
      throw 'string error';
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('string error');
    }
  });

  it('should handle throwing undefined', () => {
    const result = syncTry(() => {
      throw undefined;
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Expected error, but caught `undefined` (undefined)');
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
    const errorMessage = 'Test error';
    const result = await asyncTry(async () => {
      throw new Error(errorMessage);
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(errorMessage);
    }
  });

  it('should handle non-Error rejections by converting them to Error objects', async () => {
    const errorMessage = 'Test error';
    const result = await asyncTry(async () => {
      throw errorMessage;
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(errorMessage);
    }
  });

  it('should handle rejecting with undefined', async () => {
    const result = await asyncTry(async () => {
      throw undefined;
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Expected error, but caught `undefined` (undefined)');
    }
  });

  it('should handle rejected promises', async () => {
    const errorMessage = 'Promise rejection';
    const result = await asyncTry(async () => {
      return Promise.reject(new Error(errorMessage));
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(errorMessage);
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
    const errorMessage = 'Test error';
    const asyncResults = [
      asyncTry(async () => 1),
      asyncTry(async () => {
        throw new Error(errorMessage);
      }),
      asyncTry(async () => 3),
    ] as const;

    const result = await asyncTryAll(asyncResults);

    expect(result).toEqual(
      makeSuccessResult({
        success: false,
        results: [
          {success: true, value: 1},
          {success: false, error: new Error(errorMessage)},
          {success: true, value: 3},
        ],
      })
    );
  });

  it('should handle unexpected errors during execution', async () => {
    const errorMessage = 'Test error';
    const asyncResults = [Promise.reject(errorMessage)] as unknown as readonly [
      AsyncResult<unknown>,
    ];

    const result = await asyncTryAll(asyncResults);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(errorMessage);
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
    const errorMessage = 'Test error';
    const promises = [
      Promise.resolve(1),
      Promise.reject(new Error(errorMessage)),
      Promise.resolve(3),
    ] as const;

    const result = await asyncTryAllPromises(promises);

    expect(result).toEqual(
      makeSuccessResult({
        success: false,
        results: [
          {success: true, value: 1},
          {success: false, error: new Error(errorMessage)},
          {success: true, value: 3},
        ],
      })
    );
  });

  it('should handle non-Error rejections', async () => {
    const errorMessage = 'Test error';
    const promises = [
      Promise.resolve(1),
      Promise.reject(errorMessage),
      Promise.resolve(3),
    ] as const;

    const result = await asyncTryAllPromises(promises);

    expect(result).toEqual(
      makeSuccessResult({
        success: false,
        results: [
          {success: true, value: 1},
          {success: false, error: new Error(errorMessage)},
          {success: true, value: 3},
        ],
      })
    );
  });

  it('should handle empty array input', async () => {
    const promises = [] as const;

    const result = await asyncTryAllPromises(promises);

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
    const promises = [Promise.resolve(1), Promise.reject(undefined), Promise.resolve(3)] as const;

    const result = await asyncTryAllPromises(promises);

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
});
