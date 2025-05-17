import {expectErrorResult, expectSuccessResult, unwrapOrThrow} from '@shared/lib/testUtils.shared';
import {
  getYouTubeChannelHandle,
  getYouTubeChannelId,
  isYouTubeChannelUrl,
} from '@shared/lib/youtube.shared';

import {parseYouTubeChannelId, parseYouTubeHandle} from '@shared/parsers/youtube.parser';

import type {YouTubeChannelId, YouTubeHandle} from '@shared/types/youtube.types';

const VALID_CHANNEL_ID = unwrapOrThrow<YouTubeChannelId>(
  parseYouTubeChannelId('UCndkjnoQawp7Tjy1uNj53yQ')
);
const VALID_HANDLE = unwrapOrThrow<YouTubeHandle>(parseYouTubeHandle('jacobwenger8649'));

const VALID_YOUTUBE_CHANNEL_URLS_WITH_HANDLE = [
  `https://www.youtube.com/@${VALID_HANDLE}`, // Handle.
  `https://youtube.com/@${VALID_HANDLE}`, // No prefix.
  `https://www.youtube.com/c/${VALID_HANDLE}`, // Legacy /c/ URL.
  `www.youtube.com/@${VALID_HANDLE}`, // No protocol.
  `youtube.com/@${VALID_HANDLE}`, // No prefix or protocol.
  `m.youtube.com/@${VALID_HANDLE}`, // Mobile no prefix or protocol.
];

const VALID_YOUTUBE_CHANNEL_URLS_WITH_CHANNEL_ID = [
  `https://www.youtube.com/channel/${VALID_CHANNEL_ID}`, // Channel ID.
  `https://m.youtube.com/channel/${VALID_CHANNEL_ID}`, // Mobile.
];

const NON_YOUTUBE_URLS = [
  `https://example.com/channel/${VALID_CHANNEL_ID}`, // Non-YouTube URL.
  'foo', // Invalid URL.
  '', // Empty string.
];

const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

describe('isYouTubeChannelUrl', () => {
  it.each([
    ...VALID_YOUTUBE_CHANNEL_URLS_WITH_HANDLE,
    ...VALID_YOUTUBE_CHANNEL_URLS_WITH_CHANNEL_ID,
  ])('should return true for URL "%s"', (url) => {
    expect(isYouTubeChannelUrl(url)).toBe(true);
  });

  it.each([...NON_YOUTUBE_URLS, YOUTUBE_VIDEO_URL])('should return false for value "%s"', (url) => {
    expect(isYouTubeChannelUrl(url)).toBe(false);
  });
});

describe('getYouTubeChannelId', () => {
  it.each(VALID_YOUTUBE_CHANNEL_URLS_WITH_CHANNEL_ID)(
    'should extract channel ID from URL "%s"',
    (url) => {
      const result = getYouTubeChannelId(url);
      expectSuccessResult(result, VALID_CHANNEL_ID);
    }
  );

  it.each([...NON_YOUTUBE_URLS, YOUTUBE_VIDEO_URL])('should return null from value "%s"', (url) => {
    const result = getYouTubeChannelId(url);
    expectSuccessResult(result, null);
  });
});

describe('getYouTubeChannelHandle', () => {
  it.each(VALID_YOUTUBE_CHANNEL_URLS_WITH_HANDLE)('should extract handle from URL "%s"', (url) => {
    const result = getYouTubeChannelHandle(url);
    expectSuccessResult(result, VALID_HANDLE);
  });

  it.each([...NON_YOUTUBE_URLS, YOUTUBE_VIDEO_URL])('should return null from value "%s"', (url) => {
    const result = getYouTubeChannelHandle(url);
    expectSuccessResult(result, null);
  });
});

describe('parseYouTubeChannelId', () => {
  it.each([VALID_CHANNEL_ID])('should succeed for a valid channel ID "%s"', (id) => {
    const result = parseYouTubeChannelId(id);
    expectSuccessResult(result, id);
  });

  it.each([
    'UCndkjnoQawp7Tjy1uNj53y', // Too short.
    'UCndkjnoQawp7Tjy1uNj53yQQ', // Too long.
    'ACndkjnoQawp7Tjy1uNj53yQ', // Does not start with UC.
    'UCndkjnoQawp7Tjy1uNj53y!', // Invalid character.
    'jacobwenger8649', // Not a channel ID (handle).
    'a'.repeat(24), // 24 chars but does not match regex.
    '', // Empty string.
  ])('should fail for invalid channel ID "%s"', (id) => {
    const result = parseYouTubeChannelId(id);
    expectErrorResult(result, /YouTube channel ID/);
  });
});

describe('parseYouTubeHandle', () => {
  it.each([VALID_HANDLE])('should succeed for a valid handle "%s"', (handle) => {
    const result = parseYouTubeHandle(handle);
    expectSuccessResult(result, handle);
  });

  it.each([
    'a'.repeat(129), // Too long.
    '', // Empty string.
  ])('should fail for invalid handle "%s"', (handle) => {
    const result = parseYouTubeHandle(handle);
    expectErrorResult(result, /YouTube handle/);
  });
});
