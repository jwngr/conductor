import {ErrorResult, SuccessResult} from '@shared/types/result.types';

export type RequestHeaders = Record<string, string>;
export type RequestBody = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/array-type
  object | number | string | boolean | null | Array<object | number | string | boolean | null>
>;
export type RequestParams = Record<string, string>;

export interface RequestOptions {
  readonly headers?: RequestHeaders;
  readonly body?: RequestBody;
  readonly params?: RequestParams;
  // TODO: Add timeouts and retries.
}

interface SuccessRequestResult<T extends object> extends SuccessResult<T> {
  readonly statusCode: number;
}

interface ErrorRequestResult extends ErrorResult {
  readonly statusCode: number;
}

export function makeSuccessResponse<T extends object>(
  value: T,
  statusCode: number
): SuccessRequestResult<T> {
  return {success: true, value, statusCode};
}

export function makeErrorResponse(error: Error, statusCode: number): ErrorRequestResult {
  return {success: false, error, statusCode};
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
