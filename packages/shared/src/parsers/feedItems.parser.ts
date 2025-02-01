import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';

import type {
  FeedItem,
  FeedItemAppSource,
  FeedItemExtensionSource,
  FeedItemFromStorage,
  FeedItemId,
  FeedItemRSSSource,
  FeedItemSource,
  FeedItemSourceFromStorage,
} from '@shared/types/feedItems.types';
import {
  AppFeedItemSourceSchema,
  ExtensionFeedItemSourceSchema,
  FeedItemFromStorageSchema,
  FeedItemIdSchema,
  FeedItemSourceType,
  RssFeedItemSourceSchema,
} from '@shared/types/feedItems.types';
import type {Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

/**
 * Parses a {@link FeedItemId} from a plain string. Returns an `ErrorResult` if the string is not
 * valid.
 */
export function parseFeedItemId(maybeFeedItemId: string): Result<FeedItemId> {
  const parsedResult = parseZodResult(FeedItemIdSchema, maybeFeedItemId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid feed item ID');
  }
  return makeSuccessResult(parsedResult.value as FeedItemId);
}

/**
 * Parses a {@link FeedItemSource} from an unknown value. Returns an `ErrorResult` if the value is
 * not valid.
 */
// TODO: I'm not sure if this is the best way to do this. All other parsers take in an `unknown`
// value instead of a discriminated union.
function parseFeedItemSource(feedItemSource: FeedItemSourceFromStorage): Result<FeedItemSource> {
  const sourceType = feedItemSource.type;
  switch (sourceType) {
    case FeedItemSourceType.App:
      return parseAppFeedItemSource(feedItemSource);
    case FeedItemSourceType.Extension:
      return parseExtensionFeedItemSource(feedItemSource);
    case FeedItemSourceType.RSS:
      return parseRssFeedItemSource(feedItemSource);
    default:
      return makeErrorResult(new Error(`Unknown feed item source type: ${sourceType}`));
  }
}

/**
 * Parses a {@link FeedItemAppSource} from an unknown value. Returns an `ErrorResult` if the value
 * is not valid.
 */
function parseAppFeedItemSource(feedItemSource: unknown): Result<FeedItemAppSource> {
  const parsedResult = parseZodResult(AppFeedItemSourceSchema, feedItemSource);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid app feed item source');
  }
  return makeSuccessResult(parsedResult.value);
}

/**
 * Parses a {@link FeedItemExtensionSource} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
function parseExtensionFeedItemSource(feedItemSource: unknown): Result<FeedItemExtensionSource> {
  const parsedResult = parseZodResult(ExtensionFeedItemSourceSchema, feedItemSource);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid extension feed item source');
  }
  return makeSuccessResult(parsedResult.value);
}

/**
 * Parses a {@link FeedItemRSSSource} from an unknown value. Returns an `ErrorResult` if the value
 * is not valid.
 */
function parseRssFeedItemSource(feedItemSource: unknown): Result<FeedItemRSSSource> {
  const parsedResult = parseZodResult(RssFeedItemSourceSchema, feedItemSource);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid RSS feed item source');
  }
  const parsedUserFeedSubscriptionIdResult = parseUserFeedSubscriptionId(
    parsedResult.value.userFeedSubscriptionId
  );
  if (!parsedUserFeedSubscriptionIdResult.success) return parsedUserFeedSubscriptionIdResult;

  return makeSuccessResult({
    type: FeedItemSourceType.RSS,
    userFeedSubscriptionId: parsedUserFeedSubscriptionIdResult.value,
  });
}

/**
 * Parses a {@link FeedItem} from an unknown value. Returns an `ErrorResult` if the value is not
 * valid.
 */
export function parseFeedItem(maybeFeedItem: unknown): Result<FeedItem> {
  const parsedFeedItemResult = parseZodResult(FeedItemFromStorageSchema, maybeFeedItem);
  if (!parsedFeedItemResult.success) {
    return prefixResultIfError(parsedFeedItemResult, 'Invalid feed item');
  }

  const parsedIdResult = parseFeedItemId(parsedFeedItemResult.value.feedItemId);
  if (!parsedIdResult.success) return parsedIdResult;

  const parsedAccountIdReult = parseAccountId(parsedFeedItemResult.value.accountId);
  if (!parsedAccountIdReult.success) return parsedAccountIdReult;

  const parsedSourceResult = parseFeedItemSource(parsedFeedItemResult.value.feedItemSource);
  if (!parsedSourceResult.success) return parsedSourceResult;

  return makeSuccessResult(
    omitUndefined({
      type: parsedFeedItemResult.value.type,
      accountId: parsedAccountIdReult.value,
      feedItemSource: parsedSourceResult.value,
      feedItemId: parsedIdResult.value,
      url: parsedFeedItemResult.value.url,
      title: parsedFeedItemResult.value.title,
      description: parsedFeedItemResult.value.description,
      outgoingLinks: parsedFeedItemResult.value.outgoingLinks,
      triageStatus: parsedFeedItemResult.value.triageStatus,
      tagIds: parsedFeedItemResult.value.tagIds,
      lastImportedTime: parsedFeedItemResult.value.lastImportedTime
        ? parseStorageTimestamp(parsedFeedItemResult.value.lastImportedTime)
        : undefined,
      createdTime: parseStorageTimestamp(parsedFeedItemResult.value.createdTime),
      lastUpdatedTime: parseStorageTimestamp(parsedFeedItemResult.value.lastUpdatedTime),
    })
  );
}

/**
 * Converts a {@link FeedItem} to a {@link FeedItemFromStorage} object that can be persisted to
 * Firestore.
 */
export function toStorageFeedItem(feedItem: FeedItem): FeedItemFromStorage {
  return omitUndefined({
    feedItemId: feedItem.feedItemId,
    accountId: feedItem.accountId,
    type: feedItem.type,
    feedItemSource: feedItem.feedItemSource,
    url: feedItem.url,
    title: feedItem.title,
    description: feedItem.description,
    outgoingLinks: feedItem.outgoingLinks,
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    lastImportedTime: feedItem.lastImportedTime,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  });
}
