import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixError, upgradeUnknownError} from '@shared/lib/errorUtils.shared';

import type {AsyncResponseResult, RequestBody, RequestOptions} from '@shared/types/requests.types';
import {
  HttpMethod,
  makeErrorResponseResult,
  makeSuccessResponseResult,
} from '@shared/types/requests.types';

const DEFAULT_CONTENT_TYPE = 'application/json';

function isJsonResponse(response: Response): boolean {
  const responseContentTypeHeader = response.headers.get('Content-Type');
  if (!responseContentTypeHeader) return false;
  return responseContentTypeHeader.includes('application/json');
}

async function request<T>(
  url: string,
  method: HttpMethod,
  options: RequestOptions = {}
): AsyncResponseResult<T> {
  const {headers = {}, body, params = {}} = options;

  const queryString =
    Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : ``;

  const rawResponseResult = await asyncTry(async () =>
    // Allow `fetch` here. We cannot use `request*` since we are inside its implementation.
    // eslint-disable-next-line no-restricted-syntax
    fetch(url + queryString, {
      method,
      headers: {
        'Content-Type': headers['Content-Type'] ?? DEFAULT_CONTENT_TYPE,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  );

  if (!rawResponseResult.success) {
    logger.error(prefixError(rawResponseResult.error, 'Error fetching request'), {url});
    return makeErrorResponseResult(rawResponseResult.error, 500);
  }

  const rawResponse = rawResponseResult.value;
  const statusCode = rawResponse.status;

  if (!rawResponse.ok) {
    const defaultErrorMessage = `Error ${statusCode} making ${method} request to ${url}`;

    // Clone the response in case we need to parse it multiple times.
    const rawResponseClone = rawResponse.clone();

    // Try to parse the error response as JSON.
    const unknownErrorJsonResult = await asyncTry(() => rawResponse.json());
    if (unknownErrorJsonResult.success) {
      const betterError = upgradeUnknownError(unknownErrorJsonResult.value ?? defaultErrorMessage);
      return makeErrorResponseResult(betterError, statusCode);
    }

    // Fallback to parsing as text if JSON parsing fails.
    const unknownErrorTextResult = await asyncTry(() => rawResponseClone.text());
    if (unknownErrorTextResult.success) {
      const betterError = upgradeUnknownError(unknownErrorTextResult.value ?? defaultErrorMessage);
      return makeErrorResponseResult(betterError, statusCode);
    }

    // Fallback to a default error message if JSON and text parsing both fail.
    const errorPrefix = `${defaultErrorMessage}: Failed to parse error response.`;
    logger.error(new Error(errorPrefix), {
      jsonError: unknownErrorJsonResult.error,
      textError: unknownErrorTextResult.error,
      url,
    });

    return makeErrorResponseResult(
      prefixError(unknownErrorTextResult.error, errorPrefix),
      statusCode
    );
  }

  const parsedResponseResult = await asyncTry(async () =>
    isJsonResponse(rawResponse) ? rawResponse.json() : rawResponse.text()
  );

  if (!parsedResponseResult.success) {
    logger.error(prefixError(parsedResponseResult.error, 'Error parsing response from body'), {
      url,
    });
    return makeErrorResponseResult(parsedResponseResult.error, 500);
  }

  const jsonResponse = parsedResponseResult.value;
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
