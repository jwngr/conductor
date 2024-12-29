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
}): Result<FeedItemActionEventLogItem> {
  const {userId, feedItemId, feedItemActionType} = args;

  return makeSuccessResult({
    eventId: makeEventId(),
    userId,
    eventType: EventType.FeedItemAction,
    data: {feedItemId, feedItemActionType},
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  });
}

export function makeUserFeedSubscriptionEventLogItem(args: {
  readonly userId: UserId;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}): Result<UserFeedSubscriptionEventLogItem> {
  const {userId, userFeedSubscriptionId} = args;

  return makeSuccessResult({
    eventId: makeEventId(),
    userId,
    eventType: EventType.UserFeedSubscription,
    data: {userFeedSubscriptionId},
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  });
}
