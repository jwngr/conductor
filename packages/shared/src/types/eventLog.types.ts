import {makeId} from '@shared/lib/utils';

import {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import {makeErrorResult, makeSuccessResult, Result} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';
import {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Strongly-typed type for an event's unique identifier. Prefer this over plain strings.
 */
export type EventId = string & {readonly __brand: 'EventIdBrand'};

/**
 * Checks if a value is a valid `FeedItemId`.
 */
export function isEventId(maybeEventId: unknown): maybeEventId is EventId {
  return typeof maybeEventId === 'string' && maybeEventId.length > 0;
}

/**
 * Converts a plain string into a strongly-typed `FeedItemId`. Returns an error if the string is
 * not a valid `FeedItemId`.
 */
export function makeEventId(maybeEventId: string = makeId()): Result<EventId> {
  if (!isEventId(maybeEventId)) {
    return makeErrorResult(new Error(`Invalid event ID: "${maybeEventId}"`));
  }
  return makeSuccessResult(maybeEventId);
}

export enum EventType {
  FeedItemAction = 'FEED_ITEM_ACTION',
  UserFeedSubscription = 'USER_FEED_SUBSCRIPTION',
}

interface BaseEventLogItem extends BaseStoreItem {
  readonly eventId: EventId;
  readonly userId: UserId;
  readonly eventType: EventType;
  /** Arbitrary data associated with the event. */
  readonly data?: Record<string, unknown>;
}

export interface FeedItemActionEventLogItem extends BaseEventLogItem {
  readonly eventType: EventType.FeedItemAction;
  readonly data: {
    readonly feedItemId: FeedItemId;
    readonly feedItemActionType: FeedItemActionType;
  };
}

export interface UserFeedSubscriptionEventLogItem extends BaseEventLogItem {
  readonly eventType: EventType.UserFeedSubscription;
  readonly data: {
    readonly userFeedSubscriptionId: UserFeedSubscriptionId;
    // TODO: Add `userFeedSubscriptionActionType`.
  };
}

export type EventLogItem = FeedItemActionEventLogItem | UserFeedSubscriptionEventLogItem;
