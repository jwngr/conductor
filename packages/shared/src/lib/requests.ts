import {asyncTryWithErrorMessage} from '@shared/lib/errors';

import {
  HttpMethod,
  makeErrorResponse,
  makeSuccessResponse,
  RequestBody,
  RequestOptions,
  RequestResult,
} from '@shared/types/requests.types';

async function request<T extends object>(
  url: string,
  method: HttpMethod,
  options: RequestOptions = {}
): Promise<RequestResult<T>> {
  const {headers = {}, body, params = {}} = options;

  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';

  return asyncTryWithErrorMessage<RequestResult<T>>({
    errorMessagePrefix: 'Error fetching request',
    onError: (error) => makeErrorResponse(error, 500),
    asyncFn: async () => {
      const rawResponse = await fetch(url + queryString, {
        method,
        headers: {
          'Content-Type': headers['Content-Type'] ?? 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const statusCode = rawResponse.status;

      if (!rawResponse.ok) {
        const errorResponseText = await rawResponse.text();
        const defaultErrorMessage = `Request failed with ${statusCode} status code`;
        return makeErrorResponse(new Error(errorResponseText || defaultErrorMessage), statusCode);
      }

      return asyncTryWithErrorMessage<RequestResult<T>>({
        errorMessagePrefix: 'Error parsing JSON response',
        onError: (error) => makeErrorResponse(error, 500),
        asyncFn: async () => {
          const jsonResponse = await rawResponse.json();
          return makeSuccessResponse<T>(jsonResponse, statusCode);
        },
      });
    },
  });
}

export async function requestGet<T extends object>(
  url: string,
  options?: RequestOptions
): Promise<RequestResult<T>> {
  return request<T>(url, HttpMethod.GET, options);
}

export async function requestPost<T extends object>(
  url: string,
  body: RequestBody,
  options?: RequestOptions
): Promise<RequestResult<T>> {
  return request<T>(url, HttpMethod.POST, {...options, body});
}

export async function requestDelete<T extends object>(
  url: string,
  options?: RequestOptions
): Promise<RequestResult<T>> {
  return request<T>(url, HttpMethod.DELETE, options);
}

export async function requestPut<T extends object>(
  url: string,
  body: RequestBody,
  options?: RequestOptions
): Promise<RequestResult<T>> {
  return request<T>(url, HttpMethod.PUT, {...options, body});
}
