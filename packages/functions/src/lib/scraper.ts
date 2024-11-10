import {logger} from 'firebase-functions';

/**
 * Fetches the raw HTML for a given URL.
 */
// TODO: Extend the functionality here:
// 1. Handle more than just HTML.
// 2. Extract a canonical URL (resolving redirects and removing tracking parameters).
// 3. Handle images more gracefully (download and replace links in the HTML?).
export async function fetchRawHtml(url: string): Promise<string | null> {
  try {
    const rawHtmlResponse = await fetch(url);
    return rawHtmlResponse.text();
  } catch (error) {
    // Report the failure, but allow the import to continue.
    logger.error(`Error fetching raw HTML:`, error);
    return null;
  }
}
