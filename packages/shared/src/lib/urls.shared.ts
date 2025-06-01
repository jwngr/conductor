import {syncTry} from '@shared/lib/errorUtils.shared';

function tryParseUrl(url: string): URL | null {
  if (!url || !url.includes('.')) return null;

  const withProtocol = syncTry(() => new URL(url));
  if (withProtocol.success) return withProtocol.value;

  const withHttps = syncTry(() => new URL(`https://${url}`));
  return withHttps.success ? withHttps.value : null;
}

export function isValidUrl(url: string): boolean {
  return tryParseUrl(url) !== null;
}

export function parseUrl(url: string): URL | null {
  const parsedUrl = tryParseUrl(url);
  return parsedUrl ? parsedUrl : null;
}
