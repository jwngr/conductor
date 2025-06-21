import {makeUuid} from '@shared/lib/utils.shared';

import type {Actor} from '@shared/types/actors.types';
import type {Environment} from '@shared/types/environment.types';
import type {
  EventId,
  EventLogItem,
  EventLogItemData,
  ExperimentDisabledEventLogItemData,
  ExperimentEnabledEventLogItemData,
  FeedItemActionEventLogItemData,
  FeedItemImportedEventLogItemData,
  StringExperimentValueChangedEventLogItemData,
  SubscribedToFeedEventLogItemData,
  ThemePreferenceChangedEventLogItemData,
  UnsubscribedFromFeedEventLogItemData,
} from '@shared/types/eventLog.types';
import {EventType} from '@shared/types/eventLog.types';
import type {ExperimentId, ExperimentType} from '@shared/types/experiments.types';
import type {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import type {FeedType} from '@shared/types/feeds.types';
import type {AccountId, FeedSubscriptionId} from '@shared/types/ids.types';
import type {ThemePreference} from '@shared/types/theme.types';

/**
 * Creates a new random {@link EventId}.
 */
export function makeEventId(): EventId {
  return makeUuid<EventId>();
}

export function makeEventLogItem(args: {
  readonly accountId: AccountId;
  readonly actor: Actor;
  readonly environment: Environment;
  readonly data: EventLogItemData;
}): EventLogItem {
  const {accountId, actor, environment, data} = args;
  return {
    eventId: makeEventId(),
    accountId,
    actor,
    environment,
    data,
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  } as EventLogItem;
}

////////////////////////////////////////////////
//  INDIVIDUAL EVENT LOG ITEM DATA FACTORIES  //
////////////////////////////////////////////////
export function makeFeedItemActionEventLogItemData(args: {
  readonly feedItemId: FeedItemId;
  readonly feedItemActionType: FeedItemActionType;
  readonly isUndo: boolean;
}): FeedItemActionEventLogItemData {
  const {feedItemId, feedItemActionType, isUndo} = args;
  return {
    eventType: EventType.FeedItemAction,
    feedItemId,
    feedItemActionType,
    isUndo,
  };
}

export function makeFeedItemImportedEventLogItemData(args: {
  readonly feedItemId: FeedItemId;
}): FeedItemImportedEventLogItemData {
  const {feedItemId} = args;
  return {
    eventType: EventType.FeedItemImported,
    feedItemId,
  };
}

export function makeExperimentEnabledEventLogItemData(args: {
  readonly experimentId: ExperimentId;
  readonly experimentType: ExperimentType;
}): ExperimentEnabledEventLogItemData {
  const {experimentId, experimentType} = args;
  return {
    eventType: EventType.ExperimentEnabled,
    experimentId,
    experimentType,
  };
}

export function makeExperimentDisabledEventLogItemData(args: {
  readonly experimentId: ExperimentId;
  readonly experimentType: ExperimentType;
}): ExperimentDisabledEventLogItemData {
  const {experimentId, experimentType} = args;
  return {
    eventType: EventType.ExperimentDisabled,
    experimentId,
    experimentType,
  };
}

export function makeStringExperimentValueChangedEventLogItemData(args: {
  readonly experimentId: ExperimentId;
  readonly value: string;
}): StringExperimentValueChangedEventLogItemData {
  const {experimentId, value} = args;
  return {
    eventType: EventType.StringExperimentValueChanged,
    experimentId,
    value,
  };
}

export function makeSubscribedToFeedEventLogItemData(args: {
  readonly feedType: FeedType;
  readonly feedSubscriptionId: FeedSubscriptionId;
  readonly isNewSubscription: boolean;
}): SubscribedToFeedEventLogItemData {
  const {feedType, feedSubscriptionId, isNewSubscription} = args;
  return {
    eventType: EventType.SubscribedToFeed,
    feedType,
    feedSubscriptionId,
    isNewSubscription,
  };
}

export function makeUnsubscribedFromFeedEventLogItemData(args: {
  readonly feedType: FeedType;
  readonly feedSubscriptionId: FeedSubscriptionId;
}): UnsubscribedFromFeedEventLogItemData {
  const {feedType, feedSubscriptionId} = args;
  return {
    eventType: EventType.UnsubscribedFromFeed,
    feedType,
    feedSubscriptionId,
  };
}

export function makeThemePreferenceChangedEventLogItemData(args: {
  readonly themePreference: ThemePreference;
}): ThemePreferenceChangedEventLogItemData {
  const {themePreference} = args;
  return {
    eventType: EventType.ThemePreferenceChanged,
    themePreference,
  };
}
