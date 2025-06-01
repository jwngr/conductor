import {makeUuid} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {Actor} from '@shared/types/actors.types';
import type {Environment} from '@shared/types/environment.types';
import type {EventId, EventLogItem, EventLogItemData} from '@shared/types/eventLog.types';
import {EventType} from '@shared/types/eventLog.types';
import type {ExperimentId, ExperimentType} from '@shared/types/experiments.types';
import type {FeedItemActionType, FeedItemId} from '@shared/types/feedItems.types';
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

export function makeFeedItemActionEventLogItem(args: {
  readonly accountId: AccountId;
  readonly actor: Actor;
  readonly environment: Environment;
  readonly feedItemId: FeedItemId;
  readonly feedItemActionType: FeedItemActionType;
}): EventLogItem {
  const {accountId, actor, environment, feedItemId, feedItemActionType} = args;
  return makeEventLogItem({
    accountId,
    actor,
    environment,
    data: {
      eventType: EventType.FeedItemAction,
      feedItemId,
      feedItemActionType,
    },
  });
}

export function makeFeedItemImportedEventLogItem(args: {
  readonly accountId: AccountId;
  readonly actor: Actor;
  readonly environment: Environment;
  readonly feedItemId: FeedItemId;
}): EventLogItem {
  const {accountId, actor, environment, feedItemId} = args;
  return makeEventLogItem({
    accountId,
    actor,
    environment,
    data: {
      eventType: EventType.FeedItemImported,
      feedItemId,
    },
  });
}

export function makeUserFeedSubscriptionEventLogItem(args: {
  readonly accountId: AccountId;
  readonly actor: Actor;
  readonly environment: Environment;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}): EventLogItem {
  const {accountId, actor, environment, userFeedSubscriptionId} = args;
  return makeEventLogItem({
    accountId,
    actor,
    environment,
    data: {
      eventType: EventType.UserFeedSubscription,
      userFeedSubscriptionId,
    },
  });
}

export function makeExperimentEnabledEventLogItem(args: {
  readonly accountId: AccountId;
  readonly actor: Actor;
  readonly environment: Environment;
  readonly experimentId: ExperimentId;
  readonly experimentType: ExperimentType;
}): EventLogItem {
  const {accountId, actor, environment, experimentId, experimentType} = args;
  return makeEventLogItem({
    accountId,
    actor,
    environment,
    data: {
      eventType: EventType.ExperimentEnabled,
      experimentId,
      experimentType,
    },
  });
}

export function makeExperimentDisabledEventLogItem(args: {
  readonly accountId: AccountId;
  readonly actor: Actor;
  readonly environment: Environment;
  readonly experimentId: ExperimentId;
  readonly experimentType: ExperimentType;
}): EventLogItem {
  const {accountId, actor, environment, experimentId, experimentType} = args;
  return makeEventLogItem({
    accountId,
    actor,
    environment,
    data: {
      eventType: EventType.ExperimentDisabled,
      experimentId,
      experimentType,
    },
  });
}

export function makeStringExperimentValueChangedEventLogItem(args: {
  readonly accountId: AccountId;
  readonly actor: Actor;
  readonly environment: Environment;
  readonly experimentId: ExperimentId;
  readonly value: string;
}): EventLogItem {
  const {accountId, actor, environment, experimentId, value} = args;
  return makeEventLogItem({
    accountId,
    actor,
    environment,
    data: {
      eventType: EventType.StringExperimentValueChanged,
      experimentId,
      value,
    },
  });
}
