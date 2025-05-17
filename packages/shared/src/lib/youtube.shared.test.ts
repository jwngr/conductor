import {expectErrorResult, expectResultValue, unwrapOrThrow} from '@shared/lib/testUtils.shared';
import {getYouTubeChannelId, isYouTubeChannelUrl} from '@shared/lib/youTube.shared';

import {parseYouTubeChannelId} from '@shared/parsers/youtube.parser';

import type {YouTubeChannelId} from '@shared/types/youtube.types';

const VALID_CHANNEL_ID = unwrapOrThrow<YouTubeChannelId>(
  parseYouTubeChannelId('UCndkjnoQawp7Tjy1uNj53yQ')
);
const VALID_HANDLE = unwrapOrThrow<YouTubeChannelId>(parseYouTubeChannelId('jacobwenger8649'));

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

describe('getYouTubeChannelId', () => {
  it.each(VALID_YOUTUBE_CHANNEL_URLS_WITH_HANDLE)('should extract handle from URL "%s"', (url) => {
    const result = getYouTubeChannelId(url);
    expectResultValue(result, VALID_HANDLE);
  });

  it.each(VALID_YOUTUBE_CHANNEL_URLS_WITH_CHANNEL_ID)(
    'should extract channel ID from URL "%s"',
    (url) => {
      const result = getYouTubeChannelId(url);
      expectResultValue(result, VALID_CHANNEL_ID);
    }
  );

  it.each([...NON_YOUTUBE_URLS, YOUTUBE_VIDEO_URL])('should return null from value "%s"', (url) => {
    const result = getYouTubeChannelId(url);
    expectResultValue(result, null);
  });
});

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

describe('parseYouTubeChannelId', () => {
  it('should succeed for a valid channel ID', () => {
    const result = parseYouTubeChannelId(VALID_CHANNEL_ID);
    expectResultValue(result, VALID_CHANNEL_ID);
  });

  it('should succeed for a valid handle', () => {
    const result = parseYouTubeChannelId(VALID_HANDLE);
    expectResultValue(result, VALID_HANDLE);
  });

  it('should fail for an empty string', () => {
    const result = parseYouTubeChannelId('');
    expectErrorResult(result, /Invalid YouTube channel ID/);
  });

  it('should fail for a string longer than 128 characters', () => {
    const result = parseYouTubeChannelId('a'.repeat(129));
    expectErrorResult(result, /Invalid YouTube channel ID/);
  });
});
