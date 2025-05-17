import {expectResultValue, unwrapOrThrow} from '@shared/lib/testUtils.shared';
import {getYouTubeChannelId, isYouTubeChannelUrl} from '@shared/lib/youtube.shared';

import {parseYouTubeChannelId} from '@shared/parsers/youtube.parser';

import type {YouTubeChannelId} from '@shared/types/youtube.types';

const VALID_CHANNEL_ID = unwrapOrThrow<YouTubeChannelId>(
  parseYouTubeChannelId('UCndkjnoQawp7Tjy1uNj53yQ')
);
const VALID_HANDLE = unwrapOrThrow<YouTubeChannelId>(parseYouTubeChannelId('jacobwenger8649'));

describe('getYouTubeChannelId', () => {
  it.each([
    `https://www.youtube.com/@${VALID_HANDLE}`, // Handle.
    `https://youtube.com/@${VALID_HANDLE}`, // No prefix.
    `https://www.youtube.com/c/${VALID_HANDLE}`, // Legacy /c/ URL.
    `www.youtube.com/@${VALID_HANDLE}`, // No protocol.
    `youtube.com/@${VALID_HANDLE}`, // No prefix or protocol.
    `m.youtube.com/@${VALID_HANDLE}`, // Mobile no prefix or protocol.
  ])('should extract handle from URL %s', (url) => {
    const result = getYouTubeChannelId(url);
    expectResultValue(result, VALID_HANDLE);
  });

  it.each([
    `https://www.youtube.com/channel/${VALID_CHANNEL_ID}`, // Channel ID.
    `https://m.youtube.com/channel/${VALID_CHANNEL_ID}`, // Mobile.
  ])('should extract channel ID from URL %s', (url) => {
    const result = getYouTubeChannelId(url);
    expectResultValue(result, VALID_CHANNEL_ID);
  });

  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // YouTube video URL.
    `https://example.com/channel/${VALID_CHANNEL_ID}`, // Non-YouTube URL.
    'foo', // Invalid URL.
    '', // Empty string.
  ])('should return null from URL %s', (url) => {
    const result = getYouTubeChannelId(url);
    expectResultValue(result, null);
  });
});

describe('isYouTubeChannelUrl', () => {
  it('should return true for /channel/ URLs', () => {
    expect(isYouTubeChannelUrl(`https://www.youtube.com/channel/${VALID_CHANNEL_ID}`)).toBe(true);
  });

  it('should return true for /@handle URLs', () => {
    expect(isYouTubeChannelUrl(`https://www.youtube.com/@${VALID_HANDLE}`)).toBe(true);
  });

  it('should return false for /c/ URLs (not yet supported)', () => {
    expect(isYouTubeChannelUrl(`https://www.youtube.com/c/${VALID_HANDLE}`)).toBe(false);
  });

  it('should return false for unrelated YouTube URLs', () => {
    expect(isYouTubeChannelUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false);
  });

  it('should return false for non-YouTube URLs', () => {
    expect(isYouTubeChannelUrl(`https://example.com/channel/${VALID_CHANNEL_ID}`)).toBe(false);
  });

  it('should return false for m.youtube.com URLs (mobile not supported)', () => {
    expect(isYouTubeChannelUrl(`https://m.youtube.com/channel/${VALID_CHANNEL_ID}`)).toBe(false);
  });

  it('should return false for m.youtube.com handle URLs (mobile not supported)', () => {
    expect(isYouTubeChannelUrl(`https://m.youtube.com/@${VALID_HANDLE}`)).toBe(false);
  });

  it('should handle no protocol', () => {
    expect(isYouTubeChannelUrl(`www.youtube.com/@${VALID_HANDLE}`)).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(isYouTubeChannelUrl('')).toBe(false);
  });
});

describe('parseYouTubeChannelId', () => {
  it('should succeed for a valid channel ID', () => {
    const result = parseYouTubeChannelId(VALID_CHANNEL_ID);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(VALID_CHANNEL_ID);
    }
  });

  it('should succeed for a valid handle', () => {
    const result = parseYouTubeChannelId(VALID_HANDLE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(VALID_HANDLE);
    }
  });

  it('should fail for an empty string', () => {
    const result = parseYouTubeChannelId('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toMatch(/Invalid YouTube channel ID/);
    }
  });

  it('should fail for a string longer than 128 characters', () => {
    const longId = 'a'.repeat(129);
    const result = parseYouTubeChannelId(longId);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toMatch(/Invalid YouTube channel ID/);
    }
  });
});
