import createDOMPurify from 'dompurify';
import {JSDOM} from 'jsdom';

import {syncTry} from '@shared/lib/errorUtils.shared';

import type {Result} from '@shared/types/results.types';

const jsdomWindow = new JSDOM('').window;
const domPurify = createDOMPurify(jsdomWindow);

const DOMPURIFY_SANITIZE_CONFIG = {
  // Use DOMPurify's default HTML configuration.
  USE_PROFILES: {html: true},

  // Return a string instead of a DOM object.
  RETURN_DOM: false,
};

/**
 * Sanitizes HTML content by removing potentially dangerous elements and attributes.
 */
export function sanitizeHtml(html: string): Result<string> {
  return syncTry(() => domPurify.sanitize(html, DOMPURIFY_SANITIZE_CONFIG));
}
