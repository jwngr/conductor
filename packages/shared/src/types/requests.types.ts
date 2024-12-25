import type {ErrorResult, SuccessResult} from '@shared/types/result.types';

type RequestHeaders = Record<string, string>;
export type RequestBody = Record<
  string,
  object | number | string | boolean | null | Array<object | number | string | boolean | null>
>;
type RequestParams = Record<string, string>;

export interface RequestOptions {
  readonly headers?: RequestHeaders;
  readonly body?: RequestBody;
  readonly params?: RequestParams;
  // TODO: Add timeouts and retries.
}

interface SuccessResponseResult<T> extends SuccessResult<T> {
  readonly statusCode: number;
}

interface ErrorResponseResult<E = Error> extends ErrorResult<E> {
  readonly statusCode: number;
}

export function makeSuccessResponseResult<T>(
  value: T,
  statusCode: number
): SuccessResponseResult<T> {
  return {success: true, value, statusCode};
}

export function makeErrorResponseResult(error: Error, statusCode: number): ErrorResponseResult {
  return {success: false, error, statusCode};
}

export type ResponseResult<T, E = Error> = SuccessResponseResult<T> | ErrorResponseResult<E>;

export type AsyncResponseResult<T, E = Error> = Promise<ResponseResult<T, E>>;

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
