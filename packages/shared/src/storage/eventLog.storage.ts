import {parseStorageTimestamp} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseEventId} from '@shared/parsers/eventLog.parser';
import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';

import {EventType} from '@shared/types/eventLog.types';
import type {
  EventLogItem,
  EventLogItemData,
  FeedItemActionEventLogItemData,
  FeedItemImportedEventLogItemData,
  SubscribedToFeedEventLogItemData,
  UnsubscribedFromFeedEventLogItemData,
} from '@shared/types/eventLog.types';
import type {Result} from '@shared/types/results.types';

import type {
  EventLogItemDataFromStorage,
  EventLogItemFromStorage,
  FeedItemActionEventLogItemDataFromStorage,
  FeedItemImportedEventLogItemDataFromStorage,
  SubscribedToFeedEventLogItemDataFromStorage,
  UnsubscribedFromFeedEventLogItemDataFromStorage,
} from '@shared/schemas/eventLog.schema';
import {fromStorageActor, toStorageActor} from '@shared/storage/actor.storage';

/**
 * Converts an {@link EventLogItem} into an {@link EventLogItemFromStorage}.
 */
export function toStorageEventLogItem(eventLogItem: EventLogItem): EventLogItemFromStorage {
  return {
    eventId: eventLogItem.eventId,
    accountId: eventLogItem.accountId,
    actor: toStorageActor(eventLogItem.actor),
    environment: eventLogItem.environment,
    data: toStorageEventLogItemData(eventLogItem.data),
    createdTime: eventLogItem.createdTime,
    lastUpdatedTime: eventLogItem.lastUpdatedTime,
  };
}

/**
 * Converts an {@link EventLogItemFromStorage} into an {@link EventLogItem}.
 */
export function fromStorageEventLogItem(
  eventLogItemFromStorage: EventLogItemFromStorage
): Result<EventLogItem, Error> {
  const parsedAccountIdResult = parseAccountId(eventLogItemFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedActorResult = fromStorageActor(eventLogItemFromStorage.actor);
  if (!parsedActorResult.success) return parsedActorResult;

  const parsedEventIdResult = parseEventId(eventLogItemFromStorage.eventId);
  if (!parsedEventIdResult.success) return parsedEventIdResult;

  const parsedDataResult = fromStorageEventLogItemData(eventLogItemFromStorage.data);
  if (!parsedDataResult.success) return parsedDataResult;

  return makeSuccessResult({
    eventId: parsedEventIdResult.value,
    accountId: parsedAccountIdResult.value,
    actor: parsedActorResult.value,
    environment: eventLogItemFromStorage.environment,
    data: parsedDataResult.value,
    createdTime: parseStorageTimestamp(eventLogItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(eventLogItemFromStorage.lastUpdatedTime),
  } as EventLogItem);
}

/**
 * Converts an {@link EventLogItemData} into an {@link EventLogItemDataFromStorage}.
 */
function toStorageEventLogItemData(
  eventLogItemData: EventLogItemData
): EventLogItemDataFromStorage {
  // TODO(types): Figure out why this doesn't result in any type errors.
  return eventLogItemData;
}

/**
 * Converts an {@link EventLogItemDataFromStorage} into an {@link EventLogItemData}.
 */
function fromStorageEventLogItemData(
  eventLogItemDataFromStorage: EventLogItemDataFromStorage
): Result<EventLogItemData, Error> {
  switch (eventLogItemDataFromStorage.eventType) {
    // Some events contain simple types which need no parsing.
    case EventType.ExperimentEnabled:
    case EventType.ExperimentDisabled:
    case EventType.StringExperimentValueChanged:
    case EventType.ThemePreferenceChanged:
      return makeSuccessResult(eventLogItemDataFromStorage);
    // The rest contain branded IDs or other complex types that require parsing.
    case EventType.FeedItemAction:
      return fromStorageFeedItemActionEventLogItemData(eventLogItemDataFromStorage);
    case EventType.FeedItemImported:
      return fromStorageFeedItemImportedEventLogItemData(eventLogItemDataFromStorage);
    case EventType.SubscribedToFeed:
      return fromStorageSubscribedToFeedEventLogItemData(eventLogItemDataFromStorage);
    case EventType.UnsubscribedFromFeed:
      return fromStorageUnsubscribedFromFeedEventLogItemData(eventLogItemDataFromStorage);
    default: {
      assertNever(eventLogItemDataFromStorage);
    }
  }
}

function fromStorageFeedItemActionEventLogItemData(
  eventLogItemFromStorage: FeedItemActionEventLogItemDataFromStorage
): Result<FeedItemActionEventLogItemData, Error> {
  const parsedFeedItemIdResult = parseFeedItemId(eventLogItemFromStorage.feedItemId);
  if (!parsedFeedItemIdResult.success) return parsedFeedItemIdResult;

  return makeSuccessResult({
    eventType: EventType.FeedItemAction,
    feedItemId: parsedFeedItemIdResult.value,
    feedItemActionType: eventLogItemFromStorage.feedItemActionType,
    isUndo: eventLogItemFromStorage.isUndo,
  });
}

function fromStorageFeedItemImportedEventLogItemData(
  eventLogItemFromStorage: FeedItemImportedEventLogItemDataFromStorage
): Result<FeedItemImportedEventLogItemData, Error> {
  const parsedFeedItemIdResult = parseFeedItemId(eventLogItemFromStorage.feedItemId);
  if (!parsedFeedItemIdResult.success) return parsedFeedItemIdResult;

  return makeSuccessResult({
    eventType: EventType.FeedItemImported,
    feedItemId: parsedFeedItemIdResult.value,
  });
}

function fromStorageSubscribedToFeedEventLogItemData(
  eventLogItemData: SubscribedToFeedEventLogItemDataFromStorage
): Result<SubscribedToFeedEventLogItemData, Error> {
  const parsedSubIdResult = parseUserFeedSubscriptionId(eventLogItemData.userFeedSubscriptionId);
  if (!parsedSubIdResult.success) return parsedSubIdResult;

  return makeSuccessResult({
    eventType: EventType.SubscribedToFeed,
    feedType: eventLogItemData.feedType,
    userFeedSubscriptionId: parsedSubIdResult.value,
    isNewSubscription: eventLogItemData.isNewSubscription,
  });
}

function fromStorageUnsubscribedFromFeedEventLogItemData(
  eventLogItemData: UnsubscribedFromFeedEventLogItemDataFromStorage
): Result<UnsubscribedFromFeedEventLogItemData, Error> {
  const parsedSubIdResult = parseUserFeedSubscriptionId(eventLogItemData.userFeedSubscriptionId);
  if (!parsedSubIdResult.success) return parsedSubIdResult;

  return makeSuccessResult({
    eventType: EventType.UnsubscribedFromFeed,
    feedType: eventLogItemData.feedType,
    userFeedSubscriptionId: parsedSubIdResult.value,
  });
}
