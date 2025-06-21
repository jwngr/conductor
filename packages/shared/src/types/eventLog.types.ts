import type {Actor} from '@shared/types/actors.types';
import type {Environment} from '@shared/types/environment.types';
import type {ExperimentId, ExperimentType} from '@shared/types/experiments.types';
import type {FeedItemActionType} from '@shared/types/feedItemActions.types';
import type {FeedType} from '@shared/types/feeds.types';
import type {
  AccountId,
  EventLogItemId,
  FeedItemId,
  FeedSubscriptionId,
} from '@shared/types/ids.types';
import type {ThemePreference} from '@shared/types/theme.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

export enum EventType {
  FeedItemAction = 'FEED_ITEM_ACTION',
  FeedItemImported = 'FEED_ITEM_IMPORTED',
  ExperimentEnabled = 'EXPERIMENT_ENABLED',
  ExperimentDisabled = 'EXPERIMENT_DISABLED',
  StringExperimentValueChanged = 'STRING_EXPERIMENT_VALUE_CHANGED',
  SubscribedToFeed = 'SUBSCRIBED_TO_FEED',
  UnsubscribedFromFeed = 'UNSUBSCRIBED_FROM_FEED',
  ThemePreferenceChanged = 'THEME_PREFERENCE_CHANGED',
}

interface BaseEventLogItemData extends Record<string, unknown> {
  /** The type of event being logged. */
  readonly eventType: EventType;
}

export interface FeedItemActionEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.FeedItemAction;
  readonly feedItemId: FeedItemId;
  /** The type of action that was performed. Refers to the undone action if `isUndo` is true. */
  readonly feedItemActionType: FeedItemActionType;
  /** Whether the action was an undo. If `true`, `feedItemActionType` refers to the undone action. */
  readonly isUndo: boolean;
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

export interface SubscribedToFeedEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.SubscribedToFeed;
  readonly feedType: FeedType;
  readonly feedSubscriptionId: FeedSubscriptionId;
  /** Whether this is a new subscription or resubscribing to an inactive one. */
  readonly isNewSubscription: boolean;
}

export interface UnsubscribedFromFeedEventLogItemData extends BaseEventLogItemData {
  readonly eventType: EventType.UnsubscribedFromFeed;
  readonly feedType: FeedType;
  readonly feedSubscriptionId: FeedSubscriptionId;
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
  /** The unique identifier for the event log item. */
  readonly eventLogItemId: EventLogItemId;
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

interface SubscribedToFeedEventLogItem extends BaseEventLogItem {
  readonly data: SubscribedToFeedEventLogItemData;
}

interface UnsubscribedFromFeedEventLogItem extends BaseEventLogItem {
  readonly data: UnsubscribedFromFeedEventLogItemData;
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
  | SubscribedToFeedEventLogItemData
  | UnsubscribedFromFeedEventLogItemData
  | ThemePreferenceChangedEventLogItemData;

export type EventLogItem =
  | FeedItemActionEventLogItem
  | FeedItemImportedEventLogItem
  | ExperimentEnabledEventLogItem
  | ExperimentDisabledEventLogItem
  | StringExperimentValueChangedEventLogItem
  | SubscribedToFeedEventLogItem
  | UnsubscribedFromFeedEventLogItem
  | ThemePreferenceChangedEventLogItem;
