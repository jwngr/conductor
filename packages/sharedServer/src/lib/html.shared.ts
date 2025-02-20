import createDOMPurify from 'dompurify';
import {JSDOM} from 'jsdom';

import {syncTry} from '@shared/lib/errorUtils.shared';

import type {Result} from '@shared/types/result.types';

const jsdomWindow = new JSDOM('').window;
const domPurify = createDOMPurify(jsdomWindow);

const DOMPURIFY_SANITIZE_CONFIG = {
  // Only allow HTML content.
  USE_PROFILES: {html: true},

  // Return a string instead of a DOM object.
  RETURN_DOM: false,

  // Forbid unsafe tags and attributes.
  FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onfocus', 'onmouseover', 'onmouseout'],
};

/**
 * Sanitizes HTML content by removing potentially dangerous elements and attributes.
 */
export function sanitizeHtml(html: string): Result<string> {
  return syncTry(() => domPurify.sanitize(html, DOMPURIFY_SANITIZE_CONFIG));
}
