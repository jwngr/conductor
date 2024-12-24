import {describe, expect, it} from 'vitest';

import {asyncTry, syncTry} from '@shared/lib/errors';

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
    const result = await asyncTry(async () => {
      throw 'string error';
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('string error');
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
