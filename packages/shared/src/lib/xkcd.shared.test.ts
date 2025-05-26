import {expectErrorResult, expectSuccessResult} from '@shared/lib/testUtils.shared';
import {
  isXkcdComicUrl,
  makeAbsoluteXkcdUrl,
  makeExplainXkcdUrl,
  parseXkcdComicIdFromUrl,
} from '@shared/lib/xkcd.shared';

describe('makeAbsoluteXkcdUrl', () => {
  const feedItemUrl = 'https://xkcd.com/1234/';

  it('should return https absolute URL for protocol-relative path', () => {
    expect(makeAbsoluteXkcdUrl('//imgs.xkcd.com/comics/barrel_cropped_(1).jpg', feedItemUrl)).toBe(
      'https://imgs.xkcd.com/comics/barrel_cropped_(1).jpg'
    );
  });

  it('should resolve root-relative path using feedItemUrl origin', () => {
    expect(makeAbsoluteXkcdUrl('/comics/barrel_cropped_(1).jpg', feedItemUrl)).toBe(
      'https://xkcd.com/comics/barrel_cropped_(1).jpg'
    );
  });

  it('should return unchanged for already absolute URL', () => {
    expect(
      makeAbsoluteXkcdUrl('https://imgs.xkcd.com/comics/barrel_cropped_(1).jpg', feedItemUrl)
    ).toBe('https://imgs.xkcd.com/comics/barrel_cropped_(1).jpg');
  });

  it('should return unchanged for non-root relative path if feedItemUrl is invalid', () => {
    expect(makeAbsoluteXkcdUrl('/comics/barrel_cropped_(1).jpg', 'not a url')).toBe(
      '/comics/barrel_cropped_(1).jpg'
    );
  });

  it('should return unchanged for non-slash relative path', () => {
    expect(makeAbsoluteXkcdUrl('comics/barrel_cropped_(1).jpg', feedItemUrl)).toBe(
      'comics/barrel_cropped_(1).jpg'
    );
  });
});

describe('makeExplainXkcdUrl', () => {
  it('should return the correct explainxkcd URL for a comic id', () => {
    expect(makeExplainXkcdUrl(1234)).toBe('https://www.explainxkcd.com/wiki/index.php/1234');
  });
});

describe('isXkcdComicUrl', () => {
  it.each([
    'https://xkcd.com/1234/',
    'http://xkcd.com/1234/',
    'https://www.xkcd.com/1234/',
    'xkcd.com/1234/',
    'https://xkcd.com/1234',
    'http://www.xkcd.com/1234',
  ])('should return true for XKCD comic URL "%s"', (url) => {
    expect(isXkcdComicUrl(url)).toBe(true);
  });

  it.each([
    'https://xkcd.com/',
    'https://xkcd.com',
    'https://example.com/1234/',
    'https://xkcd.com/foo/',
    'foo',
    '',
  ])('should return false for non-comic or invalid URL "%s"', (url) => {
    expect(isXkcdComicUrl(url)).toBe(false);
  });
});

describe('parseXkcdComicIdFromUrl', () => {
  it.each([
    ['https://xkcd.com/1234/', 1234],
    ['http://xkcd.com/567/', 567],
    ['https://www.xkcd.com/42/', 42],
    ['https://xkcd.com/9876', 9876],
  ])('should extract comic id %s', (url, expectedId) => {
    const result = parseXkcdComicIdFromUrl(url);
    expectSuccessResult(result, expectedId);
  });

  it('should fail for non-xkcd host', () => {
    const result = parseXkcdComicIdFromUrl('https://example.com/1234/');
    expectErrorResult(result, 'URL host is not xkcd.com');
  });

  it('should fail for missing comic id in path', () => {
    const result = parseXkcdComicIdFromUrl('https://xkcd.com/');
    expectErrorResult(result, 'Path does not contain a comic id');
  });

  it('should fail for non-numeric comic id', () => {
    const result = parseXkcdComicIdFromUrl('https://xkcd.com/foo/');
    expectErrorResult(result, 'Path does not contain a comic id');
  });

  it('should fail for invalid URL', () => {
    const result = parseXkcdComicIdFromUrl('not a url');
    expectErrorResult(result, 'Failed to parse XKCD URL');
  });
});
