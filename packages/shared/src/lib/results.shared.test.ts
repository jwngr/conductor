import {makeErrorResult, makeSuccessResult, partitionResults} from '@shared/lib/results.shared';
import {expectErrorResult, expectSuccessResult} from '@shared/lib/testUtils.shared';

import type {Result} from '@shared/types/results.types';

describe('makeSuccessResult', () => {
  it('returns a success result with a string', () => {
    const result = makeSuccessResult('test');
    expectSuccessResult(result, 'test');
  });

  it('returns a success result with undefined value', () => {
    const result = makeSuccessResult(undefined);
    expectSuccessResult(result, undefined);
  });

  it('returns a success result with null value', () => {
    const result = makeSuccessResult(null);
    expectSuccessResult(result, null);
  });

  it('returns a success result with a complex value', () => {
    const result = makeSuccessResult({a: 1, b: 2});
    expectSuccessResult(result, {a: 1, b: 2});
  });
});

describe('makeErrorResult', () => {
  it('returns an error result with a string', () => {
    const result = makeErrorResult('foo');
    expect(result.success).toBe(false);
    expect(result.error).toBe('foo');
  });

  it('returns an error result with a custom error', () => {
    const result = makeErrorResult(new Error('test'));
    expectErrorResult(result, 'test');
  });
});

describe('partitionResults', () => {
  it('partitions mixed results correctly', () => {
    const results: Array<Result<number, Error>> = [
      makeSuccessResult(1),
      makeErrorResult(new Error('error1')),
      makeSuccessResult(2),
      makeErrorResult(new Error('error2')),
      makeSuccessResult(3),
    ];

    const {successes, errors} = partitionResults(results);

    expect(successes).toHaveLength(3);
    expect(errors).toHaveLength(2);

    expect(successes[0].value).toBe(1);
    expect(successes[1].value).toBe(2);
    expect(successes[2].value).toBe(3);

    expect(errors[0].error).toBe('error1');
    expect(errors[1].error).toBe('error2');
  });

  it('handles all success results', () => {
    const results: Array<Result<string, Error>> = [
      makeSuccessResult('a'),
      makeSuccessResult('b'),
      makeSuccessResult('c'),
    ];

    const {successes, errors} = partitionResults(results);

    expect(successes).toHaveLength(3);
    expect(errors).toHaveLength(0);

    expect(successes[0].value).toBe('a');
    expect(successes[1].value).toBe('b');
    expect(successes[2].value).toBe('c');
  });

  it('handles all error results', () => {
    const results: Array<Result<number, Error>> = [
      makeErrorResult(new Error('error1')),
      makeErrorResult(new Error('error2')),
    ];

    const {successes, errors} = partitionResults(results);

    expect(successes).toHaveLength(0);
    expect(errors).toHaveLength(2);

    expect(errors[0].error.message).toBe('error1');
    expect(errors[1].error.message).toBe('error2');
  });

  it('handles empty array', () => {
    const results: Array<Result<unknown, Error>> = [];

    const {successes, errors} = partitionResults(results);

    expect(successes).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('preserves readonly arrays', () => {
    const results: ReadonlyArray<Result<number, Error>> = [
      makeSuccessResult(1),
      makeErrorResult(new Error('test')),
    ];

    const {successes, errors} = partitionResults(results);

    expect(successes).toHaveLength(1);
    expect(errors).toHaveLength(1);
  });

  it('works with complex data types', () => {
    interface ComplexType {
      id: number;
      data: string;
    }

    interface CustomError {
      code: string;
      message: string;
    }

    const complexData: ComplexType = {id: 1, data: 'test'};
    const customError: CustomError = {code: 'E001', message: 'Custom error'};

    const results: Array<Result<ComplexType, CustomError>> = [
      makeSuccessResult(complexData),
      makeErrorResult(customError),
    ];

    const {successes, errors} = partitionResults(results);

    expect(successes[0].value).toEqual(complexData);
    expect(errors[0].error).toEqual(customError);
  });
});
