import {Defuddle} from 'defuddle/node';
import type {DefuddleOptions, DefuddleResponse} from 'defuddle/node';
import createDOMPurify from 'dompurify';
import {JSDOM} from 'jsdom';

import {asyncTry, syncTry} from '@shared/lib/errorUtils.shared';

import type {AsyncResult, Result} from '@shared/types/results.types';

const jsdomWindow = new JSDOM('').window;
const domPurify = createDOMPurify(jsdomWindow);

const DOMPURIFY_SANITIZE_CONFIG = {
  // Use DOMPurify's default HTML configuration.
  USE_PROFILES: {html: true},

  // Return a string instead of a DOM object.
  RETURN_DOM: false,
};

const DEFUDDLE_OPTIONS: DefuddleOptions = {
  removeExactSelectors: true,
  removePartialSelectors: true,
};

/**
 * Sanitizes HTML content by removing potentially dangerous elements and attributes.
 */
export function sanitizeHtml(html: string): Result<string, Error> {
  return syncTry(() => domPurify.sanitize(html, DOMPURIFY_SANITIZE_CONFIG));
}

/**
 * Extracts the main HTML content from a page.
 */
export async function extractMainContent(args: {
  readonly html: string;
  readonly url: string;
}): AsyncResult<DefuddleResponse, Error> {
  const {html, url} = args;
  return await asyncTry(async () => Defuddle(html, url, {...DEFUDDLE_OPTIONS, url}));
}
