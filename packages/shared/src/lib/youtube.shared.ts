import {makeSuccessResult} from '@shared/lib/results.shared';
import {parseUrl} from '@shared/lib/urls.shared';

import {parseYouTubeChannelId, parseYouTubeHandle} from '@shared/parsers/youtube.parser';

import type {Result} from '@shared/types/results.types';
import type {YouTubeChannelId, YouTubeHandle} from '@shared/types/youtube.types';

const YOUTUBE_CHANNEL_ID_PATH_REGEX = /^\/channel\/([a-zA-Z0-9_-]+)$/i;
const YOUTUBE_CHANNEL_AT_HANDLE_PATH_REGEX = /^\/@([a-zA-Z0-9_-]+)$/i;
const YOUTUBE_CHANNEL_C_HANDLE_PATH_REGEX = /^\/c\/([a-zA-Z0-9_-]+)$/i;
const YOUTUBE_HOSTNAMES = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
];

/**
 * Normalizes a YouTube hostname by removing any prefixes.
 */
function normalizeYouTubeHostname(hostname: string): string {
  return hostname.replace(/^(www\.|m\.)/, '');
}

/**
 * Returns `true` if the provided URL is a YouTube channel URL. Handles many variations of YouTube
 * URLs.
 */
export function isYouTubeChannelUrl(url: string): boolean {
  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return false;

  const normalizedHostname = normalizeYouTubeHostname(parsedUrl.hostname);
  if (!YOUTUBE_HOSTNAMES.includes(normalizedHostname)) return false;

  if (YOUTUBE_CHANNEL_ID_PATH_REGEX.test(parsedUrl.pathname)) return true;
  if (YOUTUBE_CHANNEL_AT_HANDLE_PATH_REGEX.test(parsedUrl.pathname)) return true;
  if (YOUTUBE_CHANNEL_C_HANDLE_PATH_REGEX.test(parsedUrl.pathname)) return true;

  return false;
}

/**
 * Returns `true` if the provided URL is a YouTube video URL. Handles many variations of YouTube
 * URLs.
 */
export function isYouTubeVideoUrl(url: string): boolean {
  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return false;

  const normalizedHostname = normalizeYouTubeHostname(parsedUrl.hostname);
  if (!YOUTUBE_HOSTNAMES.includes(normalizedHostname)) return false;

  if (parsedUrl.pathname === '/watch' && parsedUrl.searchParams.has('v')) return true;

  return false;
}

/**
 * Returns the YouTube channel ID from the provided URL. Handles many variations of YouTube URLs.
 *
 * If no channel ID found, returns `null`.
 */
export function getYouTubeChannelId(url: string): Result<YouTubeChannelId | null> {
  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return makeSuccessResult(null);

  const normalizedHostname = normalizeYouTubeHostname(parsedUrl.hostname);
  if (!YOUTUBE_HOSTNAMES.includes(normalizedHostname)) return makeSuccessResult(null);

  const idMatch = parsedUrl.pathname.match(YOUTUBE_CHANNEL_ID_PATH_REGEX);
  if (idMatch) {
    return parseYouTubeChannelId(idMatch[1]);
  }

  return makeSuccessResult(null);
}

/**
 * Returns the YouTube channel handle from the provided URL. Handles many variations of YouTube
 * URLs.
 *
 * If no channel handle found, returns `null`.
 */
export function getYouTubeChannelHandle(url: string): Result<YouTubeHandle | null> {
  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return makeSuccessResult(null);

  const normalizedHostname = normalizeYouTubeHostname(parsedUrl.hostname);
  if (!YOUTUBE_HOSTNAMES.includes(normalizedHostname)) return makeSuccessResult(null);

  const handleMatch = parsedUrl.pathname.match(YOUTUBE_CHANNEL_AT_HANDLE_PATH_REGEX);
  if (handleMatch) {
    return parseYouTubeHandle(handleMatch[1]);
  }

  const legacyMatch = parsedUrl.pathname.match(YOUTUBE_CHANNEL_C_HANDLE_PATH_REGEX);
  if (legacyMatch) {
    return parseYouTubeHandle(legacyMatch[1]);
  }

  return makeSuccessResult(null);
}
