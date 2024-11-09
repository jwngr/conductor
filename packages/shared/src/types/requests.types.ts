export type RequestHeaders = Record<string, string>;
export type RequestBody = Record<string, string>;
export type RequestParams = Record<string, string>;

export interface RequestOptions {
  readonly headers?: RequestHeaders;
  readonly body?: RequestBody;
  readonly params?: RequestParams;
  // TODO: Add timeouts and retries.
}

interface SuccessResponse<T extends object> {
  readonly data: T;
  readonly statusCode: number;
}

interface ErrorResponse {
  readonly error: string;
  readonly statusCode: number;
}

export type RequestResponse<T extends object> = SuccessResponse<T> | ErrorResponse;

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
