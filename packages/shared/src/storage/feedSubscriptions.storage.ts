import {parseStorageTimestamp} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseDeliverySchedule} from '@shared/parsers/deliverySchedules.parser';
import {
  parseFeedSubscriptionId,
  parseFeedSubscriptionLifecycleState,
} from '@shared/parsers/feedSubscriptions.parser';
import {parseYouTubeChannelId} from '@shared/parsers/youtube.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import {FeedType} from '@shared/types/feedSourceTypes.types';
import {FeedSubscriptionActivityStatus} from '@shared/types/feedSubscriptions.types';
import type {
  FeedSubscription,
  FeedSubscriptionId,
  FeedSubscriptionLifecycleState,
  IntervalFeedSubscription,
  RssFeedSubscription,
  YouTubeChannelFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import type {Result} from '@shared/types/results.types';

import type {
  FeedSubscriptionFromStorage,
  FeedSubscriptionLifecycleStateFromStorage,
  IntervalFeedSubscriptionFromStorage,
  RssFeedSubscriptionFromStorage,
  YouTubeChannelFeedSubscriptionFromStorage,
} from '@shared/schemas/feedSubscriptions.schema';
import {toStorageDeliverySchedule} from '@shared/storage/deliverySchedules.storage';

/**
 * Converts a {@link FeedSubscription} into a {@link FeedSubscriptionFromStorage}.
 */
export function toStorageFeedSubscription(
  feedSubscription: FeedSubscription
): FeedSubscriptionFromStorage {
  const lifecycleState = toStorageFeedSubscriptionLifecycleState(feedSubscription.lifecycleState);

  switch (feedSubscription.feedType) {
    case FeedType.RSS:
      return {
        feedType: FeedType.RSS,
        feedSubscriptionId: feedSubscription.feedSubscriptionId,
        url: feedSubscription.url,
        title: feedSubscription.title,
        accountId: feedSubscription.accountId,
        lifecycleState,
        createdTime: feedSubscription.createdTime,
        lastUpdatedTime: feedSubscription.lastUpdatedTime,
        deliverySchedule: toStorageDeliverySchedule(feedSubscription.deliverySchedule),
      };
    case FeedType.YouTubeChannel:
      return {
        feedType: FeedType.YouTubeChannel,
        feedSubscriptionId: feedSubscription.feedSubscriptionId,
        channelId: feedSubscription.channelId,
        accountId: feedSubscription.accountId,
        lifecycleState,
        createdTime: feedSubscription.createdTime,
        lastUpdatedTime: feedSubscription.lastUpdatedTime,
        deliverySchedule: toStorageDeliverySchedule(feedSubscription.deliverySchedule),
      };
    case FeedType.Interval:
      return {
        feedType: FeedType.Interval,
        intervalSeconds: feedSubscription.intervalSeconds,
        feedSubscriptionId: feedSubscription.feedSubscriptionId,
        accountId: feedSubscription.accountId,
        lifecycleState,
        createdTime: feedSubscription.createdTime,
        lastUpdatedTime: feedSubscription.lastUpdatedTime,
        deliverySchedule: toStorageDeliverySchedule(feedSubscription.deliverySchedule),
      };
    default:
      assertNever(feedSubscription);
  }
}

/**
 * Converts a {@link FeedSubscriptionLifecycleState} into a {@link FeedSubscriptionLifecycleStateFromStorage}.
 */
function toStorageFeedSubscriptionLifecycleState(
  lifecycleState: FeedSubscriptionLifecycleState
): FeedSubscriptionLifecycleStateFromStorage {
  switch (lifecycleState.status) {
    case FeedSubscriptionActivityStatus.Active:
      return {
        status: FeedSubscriptionActivityStatus.Active,
      };
    case FeedSubscriptionActivityStatus.Inactive:
      return {
        status: FeedSubscriptionActivityStatus.Inactive,
        unsubscribedTime: lifecycleState.unsubscribedTime,
      };
    default:
      assertNever(lifecycleState);
  }
}

/**
 * Converts a {@link FeedSubscriptionFromStorage} into a {@link FeedSubscription}.
 */
export function fromStorageFeedSubscription(
  feedSubscriptionFromStorage: FeedSubscriptionFromStorage
): Result<FeedSubscription, Error> {
  const parsedAccountIdResult = parseAccountId(feedSubscriptionFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedFeedSubscriptionIdResult = parseFeedSubscriptionId(
    feedSubscriptionFromStorage.feedSubscriptionId
  );
  if (!parsedFeedSubscriptionIdResult.success) return parsedFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(
    feedSubscriptionFromStorage.deliverySchedule
  );
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  const parsedLifecycleStateResult = parseFeedSubscriptionLifecycleState(
    feedSubscriptionFromStorage.lifecycleState
  );
  if (!parsedLifecycleStateResult.success) return parsedLifecycleStateResult;

  switch (feedSubscriptionFromStorage.feedType) {
    case FeedType.RSS:
      return fromStorageRssFeedSubscription({
        feedSubscriptionFromStorage,
        accountId: parsedAccountIdResult.value,
        feedSubscriptionId: parsedFeedSubscriptionIdResult.value,
        deliverySchedule: parsedDeliveryScheduleResult.value,
        lifecycleState: parsedLifecycleStateResult.value,
      });
    case FeedType.YouTubeChannel:
      return fromStorageYouTubeChannelFeedSubscription({
        feedSubscriptionFromStorage,
        accountId: parsedAccountIdResult.value,
        feedSubscriptionId: parsedFeedSubscriptionIdResult.value,
        deliverySchedule: parsedDeliveryScheduleResult.value,
        lifecycleState: parsedLifecycleStateResult.value,
      });
    case FeedType.Interval:
      return fromStorageIntervalFeedSubscription({
        feedSubscriptionFromStorage,
        accountId: parsedAccountIdResult.value,
        feedSubscriptionId: parsedFeedSubscriptionIdResult.value,
        deliverySchedule: parsedDeliveryScheduleResult.value,
        lifecycleState: parsedLifecycleStateResult.value,
      });
    default:
      assertNever(feedSubscriptionFromStorage);
  }
}

function fromStorageRssFeedSubscription(args: {
  readonly feedSubscriptionFromStorage: RssFeedSubscriptionFromStorage;
  readonly accountId: AccountId;
  readonly feedSubscriptionId: FeedSubscriptionId;
  readonly deliverySchedule: DeliverySchedule;
  readonly lifecycleState: FeedSubscriptionLifecycleState;
}): Result<RssFeedSubscription, Error> {
  const {
    feedSubscriptionFromStorage,
    accountId,
    feedSubscriptionId,
    deliverySchedule,
    lifecycleState,
  } = args;

  return makeSuccessResult({
    feedType: FeedType.RSS,
    feedSubscriptionId,
    accountId,
    lifecycleState,
    deliverySchedule,
    url: feedSubscriptionFromStorage.url,
    title: feedSubscriptionFromStorage.title,
    createdTime: parseStorageTimestamp(feedSubscriptionFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedSubscriptionFromStorage.lastUpdatedTime),
  });
}

function fromStorageYouTubeChannelFeedSubscription(args: {
  readonly feedSubscriptionFromStorage: YouTubeChannelFeedSubscriptionFromStorage;
  readonly accountId: AccountId;
  readonly feedSubscriptionId: FeedSubscriptionId;
  readonly deliverySchedule: DeliverySchedule;
  readonly lifecycleState: FeedSubscriptionLifecycleState;
}): Result<YouTubeChannelFeedSubscription, Error> {
  const {
    feedSubscriptionFromStorage,
    accountId,
    feedSubscriptionId,
    deliverySchedule,
    lifecycleState,
  } = args;

  const parsedChannelIdResult = parseYouTubeChannelId(feedSubscriptionFromStorage.channelId);
  if (!parsedChannelIdResult.success) return parsedChannelIdResult;

  const parsedLifecycleStateResult = parseFeedSubscriptionLifecycleState(
    feedSubscriptionFromStorage.lifecycleState
  );
  if (!parsedLifecycleStateResult.success) return parsedLifecycleStateResult;

  return makeSuccessResult({
    feedType: FeedType.YouTubeChannel,
    channelId: parsedChannelIdResult.value,
    feedSubscriptionId,
    accountId,
    lifecycleState,
    deliverySchedule,
    createdTime: parseStorageTimestamp(feedSubscriptionFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedSubscriptionFromStorage.lastUpdatedTime),
  });
}

function fromStorageIntervalFeedSubscription(args: {
  readonly feedSubscriptionFromStorage: IntervalFeedSubscriptionFromStorage;
  readonly accountId: AccountId;
  readonly feedSubscriptionId: FeedSubscriptionId;
  readonly deliverySchedule: DeliverySchedule;
  readonly lifecycleState: FeedSubscriptionLifecycleState;
}): Result<IntervalFeedSubscription, Error> {
  const {
    feedSubscriptionFromStorage,
    accountId,
    feedSubscriptionId,
    deliverySchedule,
    lifecycleState,
  } = args;

  const parsedLifecycleStateResult = parseFeedSubscriptionLifecycleState(
    feedSubscriptionFromStorage.lifecycleState
  );
  if (!parsedLifecycleStateResult.success) return parsedLifecycleStateResult;

  return makeSuccessResult({
    feedType: FeedType.Interval,
    intervalSeconds: feedSubscriptionFromStorage.intervalSeconds,
    feedSubscriptionId,
    accountId,
    lifecycleState,
    deliverySchedule,
    createdTime: parseStorageTimestamp(feedSubscriptionFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedSubscriptionFromStorage.lastUpdatedTime),
  });
}
