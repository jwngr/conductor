import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import {parseUserFeedSubscription} from '@shared/parsers/userFeedSubscriptions.parser';

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

  // If the subscription was not marked as inactive, do nothing.
  const becameInactive = before.isActive && !after.isActive;
  if (!becameInactive) {
    return makeSuccessResult(undefined);
  }

  // Unsubscribe the account from the feed.
  const unsubscribeResult = await rssFeedService.unsubscribeAccountFromUrl({
    feedSourceId: after.feedSourceId,
    url: after.url,
    accountId: after.accountId,
  });
  return prefixResultIfError(unsubscribeResult, 'Error unsubscribing account from Superfeedr feed');
}
