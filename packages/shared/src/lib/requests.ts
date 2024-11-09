import {
  HttpMethod,
  RequestBody,
  RequestOptions,
  RequestResponse,
} from '@shared/types/requests.types';

async function request<T extends object>(
  url: string,
  method: HttpMethod,
  options: RequestOptions = {}
): Promise<RequestResponse<T>> {
  const {headers = {}, body, params = {}} = options;

  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';

  try {
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
      return {
        error: errorResponseText || defaultErrorMessage,
        statusCode,
      };
    }

    return {
      data: (await rawResponse.json()) as T,
      statusCode,
    };
  } catch (error) {
    let betterError: Error;
    const errorMessagePrefix = 'Failed to fetch request';
    const defaultErrorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      betterError = new Error(`${errorMessagePrefix}: ${error.message}`, {cause: error});
    } else {
      betterError = new Error(`${errorMessagePrefix}: ${error ?? defaultErrorMessage}`);
    }

    return {
      error: betterError.message,
      statusCode: 500,
    };
  }
}

export async function requestGet<T extends object>(
  url: string,
  options?: RequestOptions
): Promise<RequestResponse<T>> {
  return request<T>(url, HttpMethod.GET, options);
}

export async function requestPost<T extends object>(
  url: string,
  body: RequestBody,
  options?: RequestOptions
): Promise<RequestResponse<T>> {
  return request<T>(url, HttpMethod.POST, {...options, body});
}

export async function requestDelete<T extends object>(
  url: string,
  options?: RequestOptions
): Promise<RequestResponse<T>> {
  return request<T>(url, HttpMethod.DELETE, options);
}

export async function requestPut<T extends object>(
  url: string,
  body: RequestBody,
  options?: RequestOptions
): Promise<RequestResponse<T>> {
  return request<T>(url, HttpMethod.PUT, {...options, body});
}
