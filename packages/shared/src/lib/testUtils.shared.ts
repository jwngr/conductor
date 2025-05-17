import type {Result} from '@shared/types/results.types';

/**
 * A convenience function to quickly assert that a {@link Result} is successful and has the expected
 * value.
 */
export function expectSuccessResult<T>(result: Result<T>, expectedValue: T): void {
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.value).toStrictEqual(expectedValue);
  }
}

/**
 * A convenience function to quickly assert that a {@link Result} is not successful and has the
 * expected error message.
 */
export function expectErrorResult<T>(
  result: Result<T>,
  expectedErrorMessage?: string | RegExp
): void {
  expect(result.success).toBe(false);
  if (expectedErrorMessage && !result.success) {
    expect(result.error.message).toMatch(expectedErrorMessage);
  }
}

/**
 * A convenience method to quickly unwrap a result, or throw an error if no result to unwrap.
 *
 * WARNING: This method is unsafe. It throws an error if the result is not successful.
 */
export function unwrapOrThrow<T>(result: Result<T>): T {
  if (result.success) return result.value;

  // This is a test utility function, so it is okay to throw.
  // eslint-disable-next-line no-restricted-syntax
  throw new Error('Result was not successful');
}
