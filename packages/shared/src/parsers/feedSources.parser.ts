import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {
  EXTENSION_FEED_SOURCE,
  POCKET_EXPORT_FEED_SOURCE,
  PWA_FEED_SOURCE,
} from '@shared/lib/feedSources.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';
import {parseYouTubeChannelId} from '@shared/parsers/youtube.parser';

import type {
  FeedSource,
  IntervalFeedSource,
  RssFeedSource,
  YouTubeChannelFeedSource,
} from '@shared/types/feedSources.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {Result} from '@shared/types/results.types';

import {
  FeedSourceSchema,
  IntervalFeedSourceSchema,
  RssFeedSourceSchema,
  YouTubeChannelFeedSourceSchema,
} from '@shared/schemas/feedSources.schema';

/**
 * Parses a {@link UserFeedSubscription} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
export function parseFeedSource(
  maybeFeedSource: unknown
): Result<Exclude<FeedSource, IntervalFeedSource>> {
  const parsedFeedSourceResult = parseZodResult(FeedSourceSchema, maybeFeedSource);
  if (!parsedFeedSourceResult.success) {
    return prefixErrorResult(parsedFeedSourceResult, 'Invalid feed source');
  }
  const parsedFeedSource = parsedFeedSourceResult.value;

  switch (parsedFeedSource.feedSourceType) {
    case FeedSourceType.RSS:
      return parseRssFeedSource(parsedFeedSource);
    case FeedSourceType.YouTubeChannel:
      return parseYouTubeChannelFeedSource(parsedFeedSource);
    case FeedSourceType.Extension:
      return makeSuccessResult(EXTENSION_FEED_SOURCE);
    case FeedSourceType.PocketExport:
      return makeSuccessResult(POCKET_EXPORT_FEED_SOURCE);
    case FeedSourceType.PWA:
      return makeSuccessResult(PWA_FEED_SOURCE);
    default:
      return makeErrorResult(new Error('Unexpected feed source type'));
  }
}

function parseRssFeedSource(maybeRssFeedSource: unknown): Result<RssFeedSource> {
  const parsedResult = parseZodResult(RssFeedSourceSchema, maybeRssFeedSource);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid RSS feed source');
  }
  const parsedRssFeedSource = parsedResult.value;

  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    parsedRssFeedSource.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  return makeSuccessResult(
    omitUndefined({
      feedSourceType: FeedSourceType.RSS,
      userFeedSubscriptionId: parsedFeedSubIdResult.value,
      url: parsedRssFeedSource.url,
      title: parsedRssFeedSource.title,
    })
  );
}

function parseYouTubeChannelFeedSource(
  maybeYouTubeChannelFeedSource: unknown
): Result<YouTubeChannelFeedSource> {
  const parsedResult = parseZodResult(
    YouTubeChannelFeedSourceSchema,
    maybeYouTubeChannelFeedSource
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid YouTube channel feed source');
  }
  const parsedYouTubeChannelFeedSource = parsedResult.value;

  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    parsedYouTubeChannelFeedSource.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  const parsedChannelIdResult = parseYouTubeChannelId(parsedYouTubeChannelFeedSource.channelId);
  if (!parsedChannelIdResult.success) return parsedChannelIdResult;

  return makeSuccessResult(
    omitUndefined({
      feedSourceType: FeedSourceType.YouTubeChannel,
      userFeedSubscriptionId: parsedFeedSubIdResult.value,
      channelId: parsedChannelIdResult.value,
    })
  );
}

export function parseIntervalFeedSource(
  maybeIntervalFeedSource: unknown
): Result<IntervalFeedSource> {
  const parsedResult = parseZodResult(IntervalFeedSourceSchema, maybeIntervalFeedSource);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid interval feed source');
  }
  const parsedIntervalFeedSource = parsedResult.value;

  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    parsedIntervalFeedSource.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  return makeSuccessResult(
    omitUndefined({
      feedSourceType: FeedSourceType.Interval,
      userFeedSubscriptionId: parsedFeedSubIdResult.value,
    })
  );
}
