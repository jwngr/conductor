import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';
import type {YouTubeChannelId, YouTubeHandle} from '@shared/types/youtube.types';
import {YouTubeChannelIdSchema, YouTubeHandleSchema} from '@shared/types/youtube.types';

/**
 * Parses a {@link YouTubeChannelId} from a plain string. Returns an `ErrorResult` if the string is
 * not valid.
 */
export function parseYouTubeChannelId(maybeYouTubeChannelId: string): Result<YouTubeChannelId> {
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
export function parseYouTubeHandle(maybeYouTubeHandle: string): Result<YouTubeHandle> {
  const parsedResult = parseZodResult(YouTubeHandleSchema, maybeYouTubeHandle);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid YouTube handle');
  }
  return makeSuccessResult(parsedResult.value as YouTubeHandle);
}
