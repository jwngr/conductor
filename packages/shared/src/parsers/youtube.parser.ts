import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {YouTubeChannelId} from '@shared/types/youtube.types';
import {YouTubeChannelIdSchema} from '@shared/types/youtube.types';

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
