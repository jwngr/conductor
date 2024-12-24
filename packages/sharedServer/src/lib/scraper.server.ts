import {asyncTry} from '@shared/lib/errors';

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
    // TODO: Use shared `request` helper instead of `fetch`.
    const rawHtmlResponse = await fetch(url);

    const responseText = await rawHtmlResponse.text();

    if (!rawHtmlResponse.ok) {
      throw new Error(
        `Failed fetching HTML for url "${url}" with status "${rawHtmlResponse.status}: ${rawHtmlResponse.statusText}": ${responseText}`
      );
    }

    return responseText;
  });
}
