export type RequestHeaders = Record<string, string>;
export type RequestBody = Record<string, string>;
export type RequestParams = Record<string, string>;

export interface RequestOptions {
  readonly headers?: RequestHeaders;
  readonly body?: RequestBody;
  readonly params?: RequestParams;
  // TODO: Add timeouts and retries.
}

export interface SuccessResponse<T extends object> {
  readonly data: T;
  readonly statusCode: number;
}

export interface ErrorResponse {
  readonly error: Error;
  readonly statusCode: number;
}

export function makeSuccessResponse<T extends object>(
  data: T,
  statusCode: number
): SuccessResponse<T> {
  return {data, statusCode};
}

export function makeErrorResponse(error: Error, statusCode: number): ErrorResponse {
  return {error, statusCode};
}

export type RequestResponse<T extends object> = SuccessResponse<T> | ErrorResponse;

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
