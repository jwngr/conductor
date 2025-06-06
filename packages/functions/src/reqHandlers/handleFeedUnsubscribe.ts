import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseUserFeedSubscription} from '@shared/parsers/userFeedSubscriptions.parser';

import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';

export async function handleFeedUnsubscribe(args: {
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
  switch (after.feedSourceType) {
    case FeedSourceType.RSS:
      return await rssFeedService.unsubscribeFromUrl(after.url);
    case FeedSourceType.YouTubeChannel:
    case FeedSourceType.Interval:
      // Feed sources with no unsubscribing required.
      return makeSuccessResult(undefined);
    default:
      assertNever(after);
  }
}
