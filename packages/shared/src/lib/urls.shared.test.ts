import {isValidUrl, parseUrl} from '@shared/lib/urls.shared';

describe('isValidUrl', () => {
  it('should accept valid URLs with protocol', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://sub.example.com/path?query=123')).toBe(true);
    expect(isValidUrl('https://example.com:8080')).toBe(true);
  });

  it('should accept valid URLs without protocol', () => {
    expect(isValidUrl('example.com')).toBe(true);
    expect(isValidUrl('sub.example.com')).toBe(true);
    expect(isValidUrl('example.com/path')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('http://')).toBe(false);
    expect(isValidUrl('https://')).toBe(false);
    expect(isValidUrl('://example.com')).toBe(false);
  });
});

describe('parseUrl', () => {
  it('should return normalized URL for valid URLs with protocol', () => {
    expect(parseUrl('https://example.com')).toStrictEqual(new URL('https://example.com/'));
    expect(parseUrl('http://example.com')).toStrictEqual(new URL('http://example.com/'));
    expect(parseUrl('https://sub.example.com/path?query=123')).toStrictEqual(
      new URL('https://sub.example.com/path?query=123')
    );
    expect(parseUrl('https://example.com:8080')).toStrictEqual(
      new URL('https://example.com:8080/')
    );
  });

  it('should add https:// for valid URLs without protocol', () => {
    expect(parseUrl('example.com')).toStrictEqual(new URL('https://example.com/'));
    expect(parseUrl('sub.example.com')).toStrictEqual(new URL('https://sub.example.com/'));
    expect(parseUrl('example.com/path')).toStrictEqual(new URL('https://example.com/path'));
  });

  it('should return null for invalid URLs', () => {
    expect(parseUrl('')).toBe(null);
    expect(parseUrl('not a url')).toBe(null);
    expect(parseUrl('http://')).toBe(null);
    expect(parseUrl('https://')).toBe(null);
    expect(parseUrl('://example.com')).toBe(null);
  });
});
