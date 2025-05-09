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
    expect(parseUrl('https://example.com')).toBe('https://example.com/');
    expect(parseUrl('http://example.com')).toBe('http://example.com/');
    expect(parseUrl('https://sub.example.com/path?query=123')).toBe(
      'https://sub.example.com/path?query=123'
    );
    expect(parseUrl('https://example.com:8080')).toBe('https://example.com:8080/');
  });

  it('should add https:// for valid URLs without protocol', () => {
    expect(parseUrl('example.com')).toBe('https://example.com/');
    expect(parseUrl('sub.example.com')).toBe('https://sub.example.com/');
    expect(parseUrl('example.com/path')).toBe('https://example.com/path');
  });

  it('should return null for invalid URLs', () => {
    expect(parseUrl('')).toBe(null);
    expect(parseUrl('not a url')).toBe(null);
    expect(parseUrl('http://')).toBe(null);
    expect(parseUrl('https://')).toBe(null);
    expect(parseUrl('://example.com')).toBe(null);
  });
});
