import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {makeUuid} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {PersistedFeedSource} from '@shared/types/feedSources.types';
import type {Result} from '@shared/types/results.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

/**
 * Creates a new random {@link UserFeedSubscriptionId}.
 */
export function makeUserFeedSubscriptionId(): UserFeedSubscriptionId {
  return makeUuid<UserFeedSubscriptionId>();
}

/**
 * Creates a new {@link UserFeedSubscription} object.
 */
export function makeUserFeedSubscription(newItemArgs: {
  readonly accountId: AccountId;
  readonly feedSource: PersistedFeedSource;
}): Result<UserFeedSubscription> {
  const {feedSource, accountId} = newItemArgs;

  const userFeedSubscriptionId = makeUserFeedSubscriptionId();

  const userFeedSubscription: UserFeedSubscription = {
    userFeedSubscriptionId,
    accountId,
    miniFeedSource: feedSource,
    isActive: true,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  };

  return makeSuccessResult(userFeedSubscription);
}
