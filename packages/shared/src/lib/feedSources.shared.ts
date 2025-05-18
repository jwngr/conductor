import {isXkcdComicUrl} from '@shared/lib/xkcd.shared';
import {isYouTubeChannelUrl} from '@shared/lib/youtube.shared';

import {FeedSourceType} from '@shared/types/feedSources.types';

/**
 * This is used to determine which {@link FeedSourceType} to use when creating a new feed source.
 *
 * Note: The return type is limited - this method assumes the feed source is persisted and ignores
 * in-memory feed sources.
 *
 * TODO: Figure out where to use this. Still seems useful.
 */
export function getFeedSourceTypeFromUrl(
  url: string
): FeedSourceType.YouTubeChannel | FeedSourceType.RSS {
  if (isYouTubeChannelUrl(url)) {
    return FeedSourceType.YouTubeChannel;
  } else if (isXkcdComicUrl(url)) {
    // TODO: Consider adding explicit XKCD feed source type.
    return FeedSourceType.RSS;
  }

  // Default to RSS.
  return FeedSourceType.RSS;
}
