import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixError, upgradeUnknownError} from '@shared/lib/errorUtils.shared';

import type {AsyncResponseResult, RequestBody, RequestOptions} from '@shared/types/requests.types';
import {
  HttpMethod,
  makeErrorResponseResult,
  makeSuccessResponseResult,
} from '@shared/types/requests.types';

async function request<T>(
  url: string,
  method: HttpMethod,
  options: RequestOptions = {}
): AsyncResponseResult<T> {
  const {headers = {}, body, params = {}} = options;

  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';

  const rawResponseResult = await asyncTry<Response>(async () => {
    // Allow `fetch` here. We cannot use `request*` since we are inside its implementation.
    // eslint-disable-next-line no-restricted-syntax
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
    return makeErrorResponseResult(rawResponseResult.error, 500);
  }

  const rawResponse = rawResponseResult.value;
  const statusCode = rawResponse.status;

  if (!rawResponse.ok) {
    const defaultErrorMessage = `Error ${statusCode} making ${method} request to ${url}`;
    const unknownErrorJsonResult = await asyncTry(() => rawResponse.json());
    if (!unknownErrorJsonResult.success) {
      const errorPrefix = `${defaultErrorMessage}: Failed to parse error response.`;
      return makeErrorResponseResult(
        prefixError(unknownErrorJsonResult.error, errorPrefix),
        statusCode
      );
    }

    const betterError = upgradeUnknownError(unknownErrorJsonResult.value ?? defaultErrorMessage);
    return makeErrorResponseResult(betterError, statusCode);
  }

  const jsonResponseResult = await asyncTry<T>(async () => {
    return (await rawResponse.json()) as T;
  });

  if (!jsonResponseResult.success) {
    logger.error('Error parsing JSON response', {error: jsonResponseResult.error, url});
    return makeErrorResponseResult(jsonResponseResult.error, 500);
  }

  const jsonResponse = jsonResponseResult.value;
  return makeSuccessResponseResult(jsonResponse, statusCode);
}

export async function requestGet<T>(url: string, options?: RequestOptions): AsyncResponseResult<T> {
  return request<T>(url, HttpMethod.GET, options);
}

export async function requestPost<T>(
  url: string,
  body: RequestBody,
  options?: RequestOptions
): AsyncResponseResult<T> {
  return request<T>(url, HttpMethod.POST, {...options, body});
}

export async function requestDelete<T>(
  url: string,
  options?: RequestOptions
): AsyncResponseResult<T> {
  return request<T>(url, HttpMethod.DELETE, options);
}

export async function requestPut<T>(
  url: string,
  body: RequestBody,
  options?: RequestOptions
): AsyncResponseResult<T> {
  return request<T>(url, HttpMethod.PUT, {...options, body});
}
