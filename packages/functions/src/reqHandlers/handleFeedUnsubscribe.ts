import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseFeedSubscription} from '@shared/parsers/feedSubscriptions.parser';

import {FeedSubscriptionActivityStatus} from '@shared/types/feedSubscriptions.types';
import {FeedType} from '@shared/types/feedTypes.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerRssFeedService} from '@sharedServer/services/rssFeed.server';

export async function handleFeedUnsubscribe(args: {
  readonly beforeData: unknown;
  readonly afterData: unknown;
  readonly rssFeedService: ServerRssFeedService;
}): AsyncResult<void, Error> {
  const {beforeData, afterData, rssFeedService} = args;

  // Parse the before and after data.
  if (!beforeData) {
    return makeErrorResult(new Error('Missing before data'));
  } else if (!afterData) {
    return makeErrorResult(new Error('Missing after data'));
  }

  const beforeResult = parseFeedSubscription(beforeData);
  const afterResult = parseFeedSubscription(afterData);

  if (!beforeResult.success || !afterResult.success) {
    return makeErrorResult(new Error('Failed to parse feed subscription data'));
  }

  const before = beforeResult.value;
  const after = afterResult.value;

  // Only do anything if the subscription was just marked as inactive.
  const becameInactive =
    before.lifecycleState.status === FeedSubscriptionActivityStatus.Active &&
    after.lifecycleState.status === FeedSubscriptionActivityStatus.Inactive;
  if (!becameInactive) return makeSuccessResult(undefined);

  // Run unsubscribing behavior for the feed source.
  switch (after.feedType) {
    case FeedType.RSS:
      return await rssFeedService.unsubscribeFromUrl(after.url);
    case FeedType.YouTubeChannel:
    case FeedType.Interval:
      // Feed sources with no unsubscribing required.
      return makeSuccessResult(undefined);
    default:
      assertNever(after);
  }
}
