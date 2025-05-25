import {makeUuid} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {Actor} from '@shared/types/actors.types';
import type {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Strongly-typed type for an event's unique identifier. Prefer this over plain strings.
 */
export type EventId = string & {readonly __brand: 'EventIdBrand'};

/**
 * Creates a new random {@link EventId}.
 */
export function makeEventId(): EventId {
  return makeUuid<EventId>();
}

export enum EventType {
  FeedItemAction = 'FEED_ITEM_ACTION',
  UserFeedSubscription = 'USER_FEED_SUBSCRIPTION',
  FeedItemImported = 'FEED_ITEM_IMPORTED',
}

export enum Environment {
  Server = 'SERVER',
  PWA = 'PWA',
  Extension = 'EXTENSION',
}

export interface FeedItemActionEventLogItemData extends Record<string, unknown> {
  readonly feedItemId: FeedItemId;
  readonly feedItemActionType: FeedItemActionType;
}

export interface UserFeedSubscriptionEventLogItemData extends Record<string, unknown> {
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  // TODO: Add `userFeedSubscriptionActionType`.
}

export interface FeedItemImportedEventLogItemData extends Record<string, unknown> {
  readonly feedItemId: FeedItemId;
}

/**
 * Base interface for all event log items. Most things that happen in the app are logged and tracked
 * as an event.
 */
interface BaseEventLogItem extends BaseStoreItem {
  readonly eventType: EventType;
  readonly eventId: EventId;
  /** The account that the event belongs to. */
  readonly accountId: AccountId;
  /** The entity who initiated the event. */
  readonly actor: Actor;
  /** The environment in which the event occurred. */
  readonly environment: Environment;
  /** Arbitrary data associated with the event. */
  readonly data?: Record<string, unknown>;
}

export interface FeedItemActionEventLogItem extends BaseEventLogItem {
  readonly eventType: EventType.FeedItemAction;
  readonly data: FeedItemActionEventLogItemData;
}

export interface UserFeedSubscriptionEventLogItem extends BaseEventLogItem {
  readonly eventType: EventType.UserFeedSubscription;
  readonly data: UserFeedSubscriptionEventLogItemData;
}

export interface FeedItemImportedEventLogItem extends BaseEventLogItem {
  readonly eventType: EventType.FeedItemImported;
  readonly data: FeedItemImportedEventLogItemData;
}

export type EventLogItem =
  | FeedItemActionEventLogItem
  | UserFeedSubscriptionEventLogItem
  | FeedItemImportedEventLogItem;
