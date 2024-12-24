import {asyncTry} from '@shared/lib/errors';
import {logger} from '@shared/lib/logger';

import type {RequestBody, RequestOptions} from '@shared/types/requests.types';
import {HttpMethod, makeErrorResponse, makeSuccessResponse} from '@shared/types/requests.types';
import type {AsyncResult} from '@shared/types/result.types';

async function request<T extends object>(
  url: string,
  method: HttpMethod,
  options: RequestOptions = {}
): AsyncResult<T> {
  const {headers = {}, body, params = {}} = options;

  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';

  const rawResponseResult = await asyncTry<Response>(async () => {
    return await fetch(url + queryString, {
      method,
      headers: {
        'Content-Type': headers['Content-Type'] ?? 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  });

  if (!rawResponseResult.success) {
    logger.error('Error fetching request', {error: rawResponseResult.error, url});
    return makeErrorResponse(rawResponseResult.error, 500);
  }

  const rawResponse = rawResponseResult.value;
  const statusCode = rawResponse.status;

  if (!rawResponse.ok) {
    const errorResponseText = await rawResponse.text();
    const defaultErrorMessage = `Request failed with ${statusCode} status code`;
    return makeErrorResponse(new Error(errorResponseText || defaultErrorMessage), statusCode);
  }

  const jsonResponseResult = await asyncTry<T>(async () => {
    return (await rawResponse.json()) as T;
  });

  if (!jsonResponseResult.success) {
    logger.error('Error parsing JSON response', {error: jsonResponseResult.error, url});
    return makeErrorResponse(jsonResponseResult.error, 500);
  }

  const jsonResponse = jsonResponseResult.value;
  return makeSuccessResponse(jsonResponse, statusCode);
}

export async function requestGet<T extends object>(
  url: string,
  options?: RequestOptions
): AsyncResult<T> {
  return request<T>(url, HttpMethod.GET, options);
}

export async function requestPost<T extends object>(
  url: string,
  body: RequestBody,
  options?: RequestOptions
): AsyncResult<T> {
  return request<T>(url, HttpMethod.POST, {...options, body});
}

export async function requestDelete<T extends object>(
  url: string,
  options?: RequestOptions
): AsyncResult<T> {
  return request<T>(url, HttpMethod.DELETE, options);
}

export async function requestPut<T extends object>(
  url: string,
  body: RequestBody,
  options?: RequestOptions
): AsyncResult<T> {
  return request<T>(url, HttpMethod.PUT, {...options, body});
}
