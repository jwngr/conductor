import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {
  parseDeliverySchedule,
  toStorageDeliverySchedule,
} from '@shared/parsers/deliverySchedules.parser';
import {
  parseIntervalMiniFeedSource,
  parseRssMiniFeedSource,
  parseYouTubeChannelMiniFeedSource,
  toStorageIntervalMiniFeedSource,
  toStorageRssMiniFeedSource,
  toStorageYouTubeChannelMiniFeedSource,
} from '@shared/parsers/feedSources.parser';

import {FeedSourceType} from '@shared/types/feedSources.types';
import type {Result} from '@shared/types/results.types';
import {
  IntervalMiniUserFeedSubscriptionSchema,
  IntervalUserFeedSubscriptionFromStorageSchema,
  MiniUserFeedSubscriptionFromStorageSchema,
  RssMiniUserFeedSubscriptionSchema,
  RssUserFeedSubscriptionFromStorageSchema,
  UserFeedSubscriptionFromStorageSchema,
  UserFeedSubscriptionIdSchema,
  YouTubeChannelMiniUserFeedSubscriptionSchema,
  YouTubeChannelUserFeedSubscriptionFromStorageSchema,
} from '@shared/types/userFeedSubscriptions.types';
import type {
  IntervalMiniUserFeedSubscription,
  IntervalUserFeedSubscription,
  MiniUserFeedSubscription,
  RssMiniUserFeedSubscription,
  RssUserFeedSubscription,
  UserFeedSubscription,
  UserFeedSubscriptionFromStorage,
  UserFeedSubscriptionId,
  YouTubeChannelMiniUserFeedSubscription,
  YouTubeChannelUserFeedSubscription,
} from '@shared/types/userFeedSubscriptions.types';

////////////////////////////////////
//  UserFeedSubscription parsers  //
///////////////////////////////////

/**
 * Parses a {@link UserFeedSubscriptionId} from a plain string. Returns an `ErrorResult` if the
 * string is not valid.
 */
export function parseUserFeedSubscriptionId(
  maybeUserFeedSubscriptionId: string
): Result<UserFeedSubscriptionId> {
  const parsedResult = parseZodResult(UserFeedSubscriptionIdSchema, maybeUserFeedSubscriptionId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription ID');
  }
  return makeSuccessResult(parsedResult.value as UserFeedSubscriptionId);
}

/**
 * Parses a {@link UserFeedSubscription} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
export function parseUserFeedSubscription(
  maybeUserFeedSubscription: unknown
): Result<UserFeedSubscription> {
  const parsedResult = parseZodResult(
    UserFeedSubscriptionFromStorageSchema,
    maybeUserFeedSubscription
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription');
  }

  switch (parsedResult.value.miniFeedSource.type) {
    case FeedSourceType.RSS:
      return parseRssUserFeedSubscription(parsedResult.value);
    case FeedSourceType.YouTubeChannel:
      return parseYouTubeChannelUserFeedSubscription(parsedResult.value);
    case FeedSourceType.Interval:
      return parseIntervalUserFeedSubscription(parsedResult.value);
    default:
      return makeErrorResult(new Error('Unexpected feed source type'));
  }
}

function parseRssUserFeedSubscription(
  maybeUserFeedSubscription: unknown
): Result<RssUserFeedSubscription> {
  const parsedResult = parseZodResult(
    RssUserFeedSubscriptionFromStorageSchema,
    maybeUserFeedSubscription
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription');
  }

  const parsedAccountIdResult = parseAccountId(parsedResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(parsedResult.value.deliverySchedule);
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  const parsedMiniFeedSourceResult = parseRssMiniFeedSource(parsedResult.value.miniFeedSource);
  if (!parsedMiniFeedSourceResult.success) return parsedMiniFeedSourceResult;

  return makeSuccessResult(
    omitUndefined({
      userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
      accountId: parsedAccountIdResult.value,
      miniFeedSource: parsedMiniFeedSourceResult.value,
      isActive: parsedResult.value.isActive,
      deliverySchedule: parsedDeliveryScheduleResult.value,
      createdTime: parseStorageTimestamp(parsedResult.value.createdTime),
      lastUpdatedTime: parseStorageTimestamp(parsedResult.value.lastUpdatedTime),
    })
  );
}

function parseYouTubeChannelUserFeedSubscription(
  maybeUserFeedSubscription: unknown
): Result<YouTubeChannelUserFeedSubscription> {
  const parsedResult = parseZodResult(
    YouTubeChannelUserFeedSubscriptionFromStorageSchema,
    maybeUserFeedSubscription
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription');
  }

  const parsedAccountIdResult = parseAccountId(parsedResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(parsedResult.value.deliverySchedule);
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  const parsedMiniFeedSourceResult = parseYouTubeChannelMiniFeedSource(
    parsedResult.value.miniFeedSource
  );
  if (!parsedMiniFeedSourceResult.success) return parsedMiniFeedSourceResult;

  return makeSuccessResult(
    omitUndefined({
      userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
      accountId: parsedAccountIdResult.value,
      miniFeedSource: parsedMiniFeedSourceResult.value,
      isActive: parsedResult.value.isActive,
      deliverySchedule: parsedDeliveryScheduleResult.value,
      createdTime: parseStorageTimestamp(parsedResult.value.createdTime),
      lastUpdatedTime: parseStorageTimestamp(parsedResult.value.lastUpdatedTime),
    })
  );
}

function parseIntervalUserFeedSubscription(
  maybeUserFeedSubscription: unknown
): Result<IntervalUserFeedSubscription> {
  const parsedResult = parseZodResult(
    IntervalUserFeedSubscriptionFromStorageSchema,
    maybeUserFeedSubscription
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription');
  }

  const parsedAccountIdResult = parseAccountId(parsedResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  const parsedDeliveryScheduleResult = parseDeliverySchedule(parsedResult.value.deliverySchedule);
  if (!parsedDeliveryScheduleResult.success) return parsedDeliveryScheduleResult;

  const parsedMiniFeedSourceResult = parseIntervalMiniFeedSource(parsedResult.value.miniFeedSource);
  if (!parsedMiniFeedSourceResult.success) return parsedMiniFeedSourceResult;

  return makeSuccessResult(
    omitUndefined({
      userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
      accountId: parsedAccountIdResult.value,
      miniFeedSource: parsedMiniFeedSourceResult.value,
      isActive: parsedResult.value.isActive,
      deliverySchedule: parsedDeliveryScheduleResult.value,
      createdTime: parseStorageTimestamp(parsedResult.value.createdTime),
      lastUpdatedTime: parseStorageTimestamp(parsedResult.value.lastUpdatedTime),
    })
  );
}

/**
 * Converts a {@link UserFeedSubscription} to a {@link UserFeedSubscriptionFromStorage} object that
 * can be persisted to Firestore.
 */
export function toStorageUserFeedSubscription(
  userFeedSubscription: UserFeedSubscription
): UserFeedSubscriptionFromStorage {
  switch (userFeedSubscription.miniFeedSource.type) {
    case FeedSourceType.RSS:
      return toStorageRssUserFeedSubscription(userFeedSubscription as RssUserFeedSubscription);
    case FeedSourceType.YouTubeChannel:
      return toStorageYouTubeChannelUserFeedSubscription(
        userFeedSubscription as YouTubeChannelUserFeedSubscription
      );
    case FeedSourceType.Interval:
      return toStorageIntervalUserFeedSubscription(
        userFeedSubscription as IntervalUserFeedSubscription
      );
    default:
      // TODO: More safely handle malformed user feed subscriptions.
      return userFeedSubscription as UserFeedSubscriptionFromStorage;
  }
}

function toStorageRssUserFeedSubscription(
  userFeedSubscription: RssUserFeedSubscription
): UserFeedSubscriptionFromStorage {
  return omitUndefined({
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    miniFeedSource: toStorageRssMiniFeedSource(userFeedSubscription.miniFeedSource),
    accountId: userFeedSubscription.accountId,
    isActive: userFeedSubscription.isActive,
    unsubscribedTime: userFeedSubscription.unsubscribedTime,
    createdTime: userFeedSubscription.createdTime,
    lastUpdatedTime: userFeedSubscription.lastUpdatedTime,
    deliverySchedule: toStorageDeliverySchedule(userFeedSubscription.deliverySchedule),
  });
}

function toStorageYouTubeChannelUserFeedSubscription(
  userFeedSubscription: YouTubeChannelUserFeedSubscription
): UserFeedSubscriptionFromStorage {
  return omitUndefined({
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    miniFeedSource: toStorageYouTubeChannelMiniFeedSource(userFeedSubscription.miniFeedSource),
    accountId: userFeedSubscription.accountId,
    isActive: userFeedSubscription.isActive,
    unsubscribedTime: userFeedSubscription.unsubscribedTime,
    createdTime: userFeedSubscription.createdTime,
    lastUpdatedTime: userFeedSubscription.lastUpdatedTime,
    deliverySchedule: toStorageDeliverySchedule(userFeedSubscription.deliverySchedule),
  });
}

function toStorageIntervalUserFeedSubscription(
  userFeedSubscription: IntervalUserFeedSubscription
): UserFeedSubscriptionFromStorage {
  return omitUndefined({
    userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
    miniFeedSource: toStorageIntervalMiniFeedSource(userFeedSubscription.miniFeedSource),
    accountId: userFeedSubscription.accountId,
    isActive: userFeedSubscription.isActive,
    unsubscribedTime: userFeedSubscription.unsubscribedTime,
    createdTime: userFeedSubscription.createdTime,
    lastUpdatedTime: userFeedSubscription.lastUpdatedTime,
    deliverySchedule: toStorageDeliverySchedule(userFeedSubscription.deliverySchedule),
  });
}

////////////////////////////////////////
//  MiniUserFeedSubscription parsers  //
////////////////////////////////////////

/**
 * Parses a {@link UserFeedSubscription} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
export function parseMiniUserFeedSubscription(
  maybeMiniUserFeedSubscription: unknown
): Result<MiniUserFeedSubscription> {
  const parsedResult = parseZodResult(
    MiniUserFeedSubscriptionFromStorageSchema,
    maybeMiniUserFeedSubscription
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid mini user feed subscription');
  }

  switch (parsedResult.value.miniFeedSource.type) {
    case FeedSourceType.RSS:
      return parseRssMiniUserFeedSubscription(parsedResult.value);
    case FeedSourceType.YouTubeChannel:
      return parseYouTubeChannelMiniUserFeedSubscription(parsedResult.value);
    case FeedSourceType.Interval:
      return parseIntervalMiniUserFeedSubscription(parsedResult.value);
    default:
      return makeErrorResult(new Error('Unexpected feed source type'));
  }
}

function parseRssMiniUserFeedSubscription(
  maybeMiniUserFeedSubscription: unknown
): Result<RssMiniUserFeedSubscription> {
  const parsedResult = parseZodResult(
    RssMiniUserFeedSubscriptionSchema,
    maybeMiniUserFeedSubscription
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid mini RSS user feed subscription');
  }

  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  const parsedMiniFeedSourceResult = parseRssMiniFeedSource(parsedResult.value.miniFeedSource);
  if (!parsedMiniFeedSourceResult.success) return parsedMiniFeedSourceResult;

  return makeSuccessResult(
    omitUndefined({
      type: FeedSourceType.RSS,
      userFeedSubscriptionId: parsedFeedSubIdResult.value,
      miniFeedSource: parsedMiniFeedSourceResult.value,
      isActive: parsedResult.value.isActive,
    })
  );
}

function parseYouTubeChannelMiniUserFeedSubscription(
  maybeMiniUserFeedSubscription: unknown
): Result<YouTubeChannelMiniUserFeedSubscription> {
  const parsedResult = parseZodResult(
    YouTubeChannelMiniUserFeedSubscriptionSchema,
    maybeMiniUserFeedSubscription
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid mini YouTube user feed subscription');
  }

  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  const parsedMiniFeedSourceResult = parseYouTubeChannelMiniFeedSource(
    parsedResult.value.miniFeedSource
  );
  if (!parsedMiniFeedSourceResult.success) return parsedMiniFeedSourceResult;

  return makeSuccessResult(
    omitUndefined({
      type: FeedSourceType.YouTubeChannel,
      userFeedSubscriptionId: parsedFeedSubIdResult.value,
      miniFeedSource: parsedMiniFeedSourceResult.value,
      isActive: parsedResult.value.isActive,
    })
  );
}

function parseIntervalMiniUserFeedSubscription(
  maybeMiniUserFeedSubscription: unknown
): Result<IntervalMiniUserFeedSubscription> {
  const parsedResult = parseZodResult(
    IntervalMiniUserFeedSubscriptionSchema,
    maybeMiniUserFeedSubscription
  );
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription');
  }

  const parsedFeedSubIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedFeedSubIdResult.success) return parsedFeedSubIdResult;

  const parsedMiniFeedSourceResult = parseIntervalMiniFeedSource(parsedResult.value.miniFeedSource);
  if (!parsedMiniFeedSourceResult.success) return parsedMiniFeedSourceResult;

  return makeSuccessResult(
    omitUndefined({
      type: FeedSourceType.Interval,
      userFeedSubscriptionId: parsedFeedSubIdResult.value,
      miniFeedSource: parsedMiniFeedSourceResult.value,
      isActive: parsedResult.value.isActive,
    })
  );
}

// function toStorageRssMiniUserFeedSubscription(
//   userFeedSubscription: RssUserFeedSubscription
// ): UserFeedSubscriptionFromStorage {
//   return omitUndefined({
//     userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
//     miniFeedSource: toStorageRssMiniFeedSource(userFeedSubscription.miniFeedSource),
//     accountId: userFeedSubscription.accountId,
//     isActive: userFeedSubscription.isActive,
//     unsubscribedTime: userFeedSubscription.unsubscribedTime,
//     createdTime: userFeedSubscription.createdTime,
//     lastUpdatedTime: userFeedSubscription.lastUpdatedTime,
//     deliverySchedule: toStorageDeliverySchedule(userFeedSubscription.deliverySchedule),
//   });
// }

// function toStorageYouTubeChannelMiniUserFeedSubscription(
//   userFeedSubscription: YouTubeChannelUserFeedSubscription
// ): UserFeedSubscriptionFromStorage {
//   return omitUndefined({
//     userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
//     miniFeedSource: toStorageYouTubeChannelMiniFeedSource(userFeedSubscription.miniFeedSource),
//     accountId: userFeedSubscription.accountId,
//     isActive: userFeedSubscription.isActive,
//     unsubscribedTime: userFeedSubscription.unsubscribedTime,
//     createdTime: userFeedSubscription.createdTime,
//     lastUpdatedTime: userFeedSubscription.lastUpdatedTime,
//     deliverySchedule: toStorageDeliverySchedule(userFeedSubscription.deliverySchedule),
//   });
// }

// function toStorageIntervalMiniUserFeedSubscription(
//   userFeedSubscription: IntervalUserFeedSubscription
// ): UserFeedSubscriptionFromStorage {
//   return omitUndefined({
//     userFeedSubscriptionId: userFeedSubscription.userFeedSubscriptionId,
//     miniFeedSource: toStorageIntervalMiniFeedSource(userFeedSubscription.miniFeedSource),
//     accountId: userFeedSubscription.accountId,
//     isActive: userFeedSubscription.isActive,
//     unsubscribedTime: userFeedSubscription.unsubscribedTime,
//     createdTime: userFeedSubscription.createdTime,
//     lastUpdatedTime: userFeedSubscription.lastUpdatedTime,
//     deliverySchedule: toStorageDeliverySchedule(userFeedSubscription.deliverySchedule),
//   });
// }
