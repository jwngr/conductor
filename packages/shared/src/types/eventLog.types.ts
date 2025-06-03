import type {AccountId} from '@shared/types/accounts.types';
import type {Actor} from '@shared/types/actors.types';
import type {Environment} from '@shared/types/environment.types';
import type {ExperimentId, ExperimentType} from '@shared/types/experiments.types';
import type {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import type {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {ThemePreference} from '@shared/types/theme.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Strongly-typed type for an event's unique identifier. Prefer this over plain strings.
 */
export type EventId = string & {readonly __brand: 'EventIdBrand'};

export enum EventType {
  FeedItemAction = 'FEED_ITEM_ACTION',
  FeedItemImported = 'FEED_ITEM_IMPORTED',
  ExperimentEnabled = 'EXPERIMENT_ENABLED',
  ExperimentDisabled = 'EXPERIMENT_DISABLED',
  StringExperimentValueChanged = 'STRING_EXPERIMENT_VALUE_CHANGED',
  SubscribedToFeedSource = 'SUBSCRIBED_TO_FEED_SOURCE',
  UnsubscribedFromFeedSource = 'UNSUBSCRIBED_FROM_FEED_SOURCE',
  ThemePreferenceChanged = 'THEME_PREFERENCE_CHANGED',
}

interface BaseEventLogItemData extends Record<string, unknown> {
  readonly eventType: EventType;
}

export interface FeedItemActionEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.FeedItemAction;
  readonly feedItemId: FeedItemId;
  readonly feedItemActionType: FeedItemActionType;
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

export interface SubscribedToFeedSourceEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.SubscribedToFeedSource;
  readonly feedSourceType: FeedSourceType;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly isResubscribe: boolean;
}

export interface UnsubscribedFromFeedSourceEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.UnsubscribedFromFeedSource;
  readonly feedSourceType: FeedSourceType;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export interface ThemePreferenceChangedEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.ThemePreferenceChanged;
  readonly themePreference: ThemePreference;
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

interface FeedItemActionEventLogItem extends BaseEventLogItem {
  readonly data: FeedItemActionEventLogItemData;
}

interface FeedItemImportedEventLogItem extends BaseEventLogItem {
  readonly data: FeedItemImportedEventLogItemData;
}

interface ExperimentEnabledEventLogItem extends BaseEventLogItem {
  readonly data: ExperimentEnabledEventLogItemData;
}

interface ExperimentDisabledEventLogItem extends BaseEventLogItem {
  readonly data: ExperimentDisabledEventLogItemData;
}

interface StringExperimentValueChangedEventLogItem extends BaseEventLogItem {
  readonly data: StringExperimentValueChangedEventLogItemData;
}

interface SubscribedToFeedSourceEventLogItem extends BaseEventLogItem {
  readonly data: SubscribedToFeedSourceEventLogItemData;
}

interface UnsubscribedFromFeedSourceEventLogItem extends BaseEventLogItem {
  readonly data: UnsubscribedFromFeedSourceEventLogItemData;
}

interface ThemePreferenceChangedEventLogItem extends BaseEventLogItem {
  readonly data: ThemePreferenceChangedEventLogItemData;
}

export type EventLogItemData =
  | FeedItemActionEventLogItemData
  | FeedItemImportedEventLogItemData
  | ExperimentEnabledEventLogItemData
  | ExperimentDisabledEventLogItemData
  | StringExperimentValueChangedEventLogItemData
  | SubscribedToFeedSourceEventLogItemData
  | UnsubscribedFromFeedSourceEventLogItemData
  | ThemePreferenceChangedEventLogItemData;

export type EventLogItem =
  | FeedItemActionEventLogItem
  | FeedItemImportedEventLogItem
  | ExperimentEnabledEventLogItem
  | ExperimentDisabledEventLogItem
  | StringExperimentValueChangedEventLogItem
  | SubscribedToFeedSourceEventLogItem
  | UnsubscribedFromFeedSourceEventLogItem
  | ThemePreferenceChangedEventLogItem;
