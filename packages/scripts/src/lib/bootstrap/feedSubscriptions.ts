import {logger} from '@shared/services/logger.shared';

import {arrayMap} from '@shared/lib/arrayUtils.shared';
import {asyncTryAll, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {FeedSubscription} from '@shared/types/feedSubscriptions.types';
import type {AccountId, FeedSubscriptionId} from '@shared/types/ids.types';
import type {AsyncResult} from '@shared/types/results.types';

import {ServerFeedSubscriptionsService} from '@sharedServer/services/feedSubscriptions.server';
import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';

import {getMockUserFeedSubscriptions} from '@src/bootstrap/feedSubscriptions.bootstrap';

export async function createSampleFeedSubscriptions(args: {
  readonly accountId: AccountId;
  readonly firebaseService: ServerFirebaseService;
}): AsyncResult<Record<FeedSubscriptionId, FeedSubscription>, Error> {
  const {accountId, firebaseService} = args;

  const feedSubscriptionsService = new ServerFeedSubscriptionsService({firebaseService});

  const mockUserFeedSubscriptions = getMockUserFeedSubscriptions({accountId});
  const saveResults = arrayMap(mockUserFeedSubscriptions, async (subscription) => {
    const saveResult = await feedSubscriptionsService.createSubscription(subscription);
    if (!saveResult.success) {
      const betterError = prefixErrorResult(saveResult, 'Failed to save user feed subscription');
      logger.error(betterError.error, {
        subscriptionId: subscription.feedSubscriptionId,
        feedType: subscription.feedType,
      });
    }
    return saveResult;
  });

  const batchSaveResult = await asyncTryAll(saveResults);
  if (!batchSaveResult.success) return batchSaveResult;
  return makeSuccessResult(mockUserFeedSubscriptions);
}
