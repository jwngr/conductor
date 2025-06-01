import {makeUuid} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
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
  SubscribedToFeedSourceEventLogItemData,
  UnsubscribedFromFeedSourceEventLogItemData,
} from '@shared/types/eventLog.types';
import {EventType} from '@shared/types/eventLog.types';
import type {ExperimentId, ExperimentType} from '@shared/types/experiments.types';
import type {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
import type {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

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
}): FeedItemActionEventLogItemData {
  const {feedItemId, feedItemActionType} = args;
  return {
    eventType: EventType.FeedItemAction,
    feedItemId,
    feedItemActionType,
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

export function makeSubscribedToFeedSourceEventLogItemData(args: {
  readonly feedSourceType: FeedSourceType;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly isResubscribe: boolean;
}): SubscribedToFeedSourceEventLogItemData {
  const {feedSourceType, userFeedSubscriptionId, isResubscribe} = args;
  return {
    eventType: EventType.SubscribedToFeedSource,
    feedSourceType,
    userFeedSubscriptionId,
    isResubscribe,
  };
}

export function makeUnsubscribedFromFeedSourceEventLogItemData(args: {
  readonly feedSourceType: FeedSourceType;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}): UnsubscribedFromFeedSourceEventLogItemData {
  const {feedSourceType, userFeedSubscriptionId} = args;
  return {
    eventType: EventType.UnsubscribedFromFeedSource,
    feedSourceType,
    userFeedSubscriptionId,
  };
}
