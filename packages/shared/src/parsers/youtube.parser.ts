import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';
import type {YouTubeChannelId, YouTubeHandle, YouTubeVideoId} from '@shared/types/youtube.types';

import {
  YouTubeChannelIdSchema,
  YouTubeHandleSchema,
  YouTubeVideoIdSchema,
} from '@shared/schemas/youtube.schema';

/**
 * Attempts to parse a plain string into a {@link YouTubeChannelId}.
 */
export function parseYouTubeChannelId(
  maybeYouTubeChannelId: string
): Result<YouTubeChannelId, Error> {
  const parsedResult = parseZodResult(YouTubeChannelIdSchema, maybeYouTubeChannelId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid YouTube channel ID');
  }
  return makeSuccessResult(parsedResult.value as YouTubeChannelId);
}

/**
 * Parses a {@link YouTubeHandle} from a plain string. Returns an `ErrorResult` if the string is not
 * valid.
 */
export function parseYouTubeHandle(maybeYouTubeHandle: string): Result<YouTubeHandle, Error> {
  const parsedResult = parseZodResult(YouTubeHandleSchema, maybeYouTubeHandle);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid YouTube handle');
  }
  return makeSuccessResult(parsedResult.value as YouTubeHandle);
}

/**
 * Parses a {@link YouTubeVideoId} from a plain string. Returns an `ErrorResult` if the string is
 * not valid.
 */
export function parseYouTubeVideoId(maybeYouTubeVideoId: string): Result<YouTubeVideoId, Error> {
  const parsedResult = parseZodResult(YouTubeVideoIdSchema, maybeYouTubeVideoId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid YouTube video ID');
  }
  return makeSuccessResult(parsedResult.value as YouTubeVideoId);
}
