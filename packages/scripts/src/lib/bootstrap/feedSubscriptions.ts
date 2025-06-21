import {logger} from '@shared/services/logger.shared';

import {arrayMap} from '@shared/lib/arrayUtils.shared';
import {asyncTryAll, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {objectValues} from '@shared/lib/objectUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {BootstrapFeedSubscriptionId} from '@shared/types/bootstrap.types';
import type {FeedItem} from '@shared/types/feedItems.types';
import type {FeedSubscription} from '@shared/types/feedSubscriptions.types';
import type {AccountId} from '@shared/types/ids.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import type {ServerFeedSubscriptionsService} from '@sharedServer/services/feedSubscriptions.server';

import {getMockUserFeedSubscriptions} from '@src/bootstrap/feedSubscriptions.bootstrap';

export async function bootstrapFeedSubscriptions(args: {
  readonly accountId: AccountId;
  readonly feedSubscriptionsService: ServerFeedSubscriptionsService;
}): AsyncResult<Record<BootstrapFeedSubscriptionId, FeedSubscription>, Error> {
  const {accountId, feedSubscriptionsService} = args;

  const mockUserFeedSubscriptions = getMockUserFeedSubscriptions({accountId});
  const saveResults = arrayMap(objectValues(mockUserFeedSubscriptions), async (subscription) => {
    const saveResult = await feedSubscriptionsService.addSubscription(subscription);
    if (!saveResult.success) {
      const betterError = prefixErrorResult(saveResult, 'Failed to save user feed subscription');
      logger.error(betterError.error, {subscription});
    }
    return saveResult;
  });

  const batchSaveResult = await asyncTryAll(saveResults);
  if (!batchSaveResult.success) return batchSaveResult;

  return makeSuccessResult(mockUserFeedSubscriptions);
}

export async function saveMockFeedData(args: {
  readonly feedSubscription: FeedSubscription;
  readonly feedItems: FeedItem[];
  readonly feedItemsService: ServerFeedItemsService;
  readonly feedSubscriptionsService: ServerFeedSubscriptionsService;
}): AsyncResult<void, Error> {
  const {feedItemsService, feedSubscriptionsService, feedSubscription, feedItems} = args;

  const saveFeedSubscriptionResult =
    await feedSubscriptionsService.addSubscription(feedSubscription);
  if (!saveFeedSubscriptionResult.success) {
    const message = 'Failed to save feed subscription';
    const errorResult = prefixErrorResult(saveFeedSubscriptionResult, message);
    logger.error(errorResult.error, {feedSubscription});
    return errorResult;
  }

  const saveFeedItemResults = arrayMap(feedItems, async (feedItem) => {
    const saveResult = await feedItemsService.addFeedItem(feedItem);
    if (!saveResult.success) {
      const errorResult = prefixErrorResult(saveResult, 'Failed to save feed item');
      logger.error(errorResult.error, {feedItem});
    }
    return saveResult;
  });

  const batchSaveResult = await asyncTryAll(saveFeedItemResults);
  if (!batchSaveResult.success) return batchSaveResult;

  return makeSuccessResult(undefined);
}
