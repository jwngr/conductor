import {asyncTry} from '@shared/lib/errorUtils.shared';
import {requestGet} from '@shared/lib/requests.shared';

import type {AsyncResult} from '@shared/types/result.types';

/**
 * Fetches the raw HTML for a given URL.
 */
// TODO: Extend the functionality here:
// 1. Handle more than just HTML.
// 2. Extract a canonical URL (resolving redirects and removing tracking parameters).
// 3. Handle images more gracefully (download and replace links in the HTML?).
export async function fetchRawHtml(url: string): AsyncResult<string> {
  return await asyncTry<string>(async () => {
    const rawHtmlResponse = await requestGet<string>(url);

    if (!rawHtmlResponse.success) {
      throw new Error(
        `Error fetching HTML for url "${url}": [${rawHtmlResponse.statusCode}] ${rawHtmlResponse.error.message}`
      );
    }

    return rawHtmlResponse.value;
  });
}
