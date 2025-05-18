import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseUserFeedSubscription} from '@shared/parsers/userFeedSubscriptions.parser';

import {FeedSourceType} from '@shared/types/feedSources.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';

export async function handleFeedUnsubscribeHelper(args: {
  readonly beforeData: unknown;
  readonly afterData: unknown;
  readonly rssFeedService: ServerRssFeedService;
}): AsyncResult<void> {
  const {beforeData, afterData, rssFeedService} = args;

  // Parse the before and after data.
  if (!beforeData) {
    return makeErrorResult(new Error('Missing before data'));
  } else if (!afterData) {
    return makeErrorResult(new Error('Missing after data'));
  }

  const beforeResult = parseUserFeedSubscription(beforeData);
  const afterResult = parseUserFeedSubscription(afterData);

  if (!beforeResult.success || !afterResult.success) {
    return makeErrorResult(new Error('Failed to parse user feed subscription data'));
  }

  const before = beforeResult.value;
  const after = afterResult.value;

  // Only do anything if the subscription was just marked as inactive.
  const becameInactive = before.isActive && !after.isActive;
  if (!becameInactive) return makeSuccessResult(undefined);

  // Run unsubscribing behavior for the feed source.
  const afterMiniFeedSource = after.miniFeedSource;
  switch (afterMiniFeedSource.type) {
    case FeedSourceType.RSS:
      return await rssFeedService.unsubscribeFromRssFeed(afterMiniFeedSource);
    case FeedSourceType.YouTubeChannel:
    case FeedSourceType.Interval:
      // TODO: Disable the server-side behavior for these once implemented.
      return makeSuccessResult(undefined);
    default:
      assertNever(afterMiniFeedSource);
  }
}
