import DOMPurify from 'dompurify';
import {JSDOM} from 'jsdom';

const window = new JSDOM('').window;
const domPurifySingleton = DOMPurify(window);

// Configure DOMPurify with sensible defaults for server-side sanitization
domPurifySingleton.setConfig({
  // Security-focused defaults
  ALLOW_DATA_ATTR: false, // Disable data-* attributes unless specifically needed
  ALLOW_UNKNOWN_PROTOCOLS: false, // Only allow known safe protocols
  SANITIZE_DOM: true, // Enable DOM clobbering protection
  SANITIZE_NAMED_PROPS: true, // Prevent named property clobbering
  KEEP_CONTENT: true, // Keep content when removing elements

  // Performance and consistency
  RETURN_DOM: false, // Return string (default, but explicit)
  RETURN_DOM_FRAGMENT: false,
  WHOLE_DOCUMENT: false,

  // Template safety (useful for preventing template injection)
  SAFE_FOR_TEMPLATES: true, // Strip template expressions like {{ }}, ${ }, <% %>

  // Use HTML profile only (disable SVG/MathML unless needed)
  USE_PROFILES: {html: true},
});

export function sanitizeHtml(dirtyHtml: string): string {
  return domPurifySingleton.sanitize(dirtyHtml);
}
