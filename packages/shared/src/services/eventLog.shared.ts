import type {FieldValue} from 'firebase/firestore';

import type {
  FeedItemActionEventLogItem,
  UserFeedSubscriptionEventLogItem,
} from '@shared/types/eventLog.types';
import {EventType, makeEventId} from '@shared/types/eventLog.types';
import type {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

export function makeFeedItemActionEventLogItem(args: {
  readonly userId: UserId;
  readonly feedItemId: FeedItemId;
  readonly feedItemActionType: FeedItemActionType;
  // TODO: These need to be passed in because server and client have different timestamps. Perhaps
  // I should just have separate services for server and client.
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
}): Result<FeedItemActionEventLogItem> {
  const {userId, feedItemId, feedItemActionType, createdTime, lastUpdatedTime} = args;

  return makeSuccessResult({
    eventId: makeEventId(),
    userId,
    eventType: EventType.FeedItemAction,
    data: {feedItemId, feedItemActionType},
    createdTime,
    lastUpdatedTime,
  });
}

export function makeUserFeedSubscriptionEventLogItem(args: {
  readonly userId: UserId;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
}): Result<UserFeedSubscriptionEventLogItem> {
  const {userId, userFeedSubscriptionId, createdTime, lastUpdatedTime} = args;

  return makeSuccessResult({
    eventId: makeEventId(),
    userId,
    eventType: EventType.UserFeedSubscription,
    data: {userFeedSubscriptionId},
    createdTime,
    lastUpdatedTime,
  });
}
