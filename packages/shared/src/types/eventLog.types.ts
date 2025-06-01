import type {AccountId} from '@shared/types/accounts.types';
import type {Actor} from '@shared/types/actors.types';
import type {Environment} from '@shared/types/environment.types';
import type {ExperimentId, ExperimentType} from '@shared/types/experiments.types';
import type {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Strongly-typed type for an event's unique identifier. Prefer this over plain strings.
 */
export type EventId = string & {readonly __brand: 'EventIdBrand'};

export enum EventType {
  FeedItemAction = 'FEED_ITEM_ACTION',
  UserFeedSubscription = 'USER_FEED_SUBSCRIPTION',
  FeedItemImported = 'FEED_ITEM_IMPORTED',
  ExperimentEnabled = 'EXPERIMENT_ENABLED',
  ExperimentDisabled = 'EXPERIMENT_DISABLED',
  StringExperimentValueChanged = 'STRING_EXPERIMENT_VALUE_CHANGED',
}

interface BaseEventLogItemData extends Record<string, unknown> {
  readonly eventType: EventType;
}

export interface FeedItemActionEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.FeedItemAction;
  readonly feedItemId: FeedItemId;
  readonly feedItemActionType: FeedItemActionType;
}

export interface UserFeedSubscriptionEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.UserFeedSubscription;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  // TODO: Add `userFeedSubscriptionActionType`.
}

export interface FeedItemImportedEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.FeedItemImported;
  readonly feedItemId: FeedItemId;
}

export interface ExperimentEnabledEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.ExperimentEnabled;
  readonly experimentId: ExperimentId;
  readonly experimentType: ExperimentType;
}

export interface ExperimentDisabledEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.ExperimentDisabled;
  readonly experimentId: ExperimentId;
  readonly experimentType: ExperimentType;
}

export interface StringExperimentValueChangedEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.StringExperimentValueChanged;
  readonly experimentId: ExperimentId;
  readonly value: string;
}

/**
 * Base interface for all event log items. Most things that happen in the app are logged and tracked
 * as an event.
 */
interface BaseEventLogItem extends BaseStoreItem {
  readonly eventId: EventId;
  /** The account that the event belongs to. */
  readonly accountId: AccountId;
  /** The entity who initiated the event. */
  readonly actor: Actor;
  /** The environment in which the event occurred. */
  readonly environment: Environment;
  /** Arbitrary data associated with the event, including the event type. */
  readonly data: EventLogItemData;
}

export interface FeedItemActionEventLogItem extends BaseEventLogItem {
  readonly data: FeedItemActionEventLogItemData;
}

export interface UserFeedSubscriptionEventLogItem extends BaseEventLogItem {
  readonly data: UserFeedSubscriptionEventLogItemData;
}

export interface FeedItemImportedEventLogItem extends BaseEventLogItem {
  readonly data: FeedItemImportedEventLogItemData;
}

export interface ExperimentEnabledEventLogItem extends BaseEventLogItem {
  readonly data: ExperimentEnabledEventLogItemData;
}

export interface ExperimentDisabledEventLogItem extends BaseEventLogItem {
  readonly data: ExperimentDisabledEventLogItemData;
}

export interface StringExperimentValueChangedEventLogItem extends BaseEventLogItem {
  readonly data: StringExperimentValueChangedEventLogItemData;
}

export type EventLogItemData =
  | FeedItemActionEventLogItemData
  | UserFeedSubscriptionEventLogItemData
  | FeedItemImportedEventLogItemData
  | ExperimentEnabledEventLogItemData
  | ExperimentDisabledEventLogItemData
  | StringExperimentValueChangedEventLogItemData;

export type EventLogItem =
  | FeedItemActionEventLogItem
  | UserFeedSubscriptionEventLogItem
  | FeedItemImportedEventLogItem
  | ExperimentEnabledEventLogItem
  | ExperimentDisabledEventLogItem
  | StringExperimentValueChangedEventLogItem;
