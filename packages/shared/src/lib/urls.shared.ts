import {syncTry} from '@shared/lib/errorUtils.shared';

// TODO: Make URL validation more robust.
export function isValidUrl(url: string): boolean {
  const isValidUrlResult1 = syncTry(() => new URL(url));
  if (isValidUrlResult1.success) return true;

  const isValidUrlResult2 = syncTry(() => new URL('https://' + url));
  return isValidUrlResult2.success;
}
