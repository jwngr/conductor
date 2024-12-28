import type {z} from 'zod';

import {
  parseZodResult,
  prefixErrorResult,
  prefixResultIfError,
} from '@shared/lib/errorUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseUserId} from '@shared/parsers/user.parser';
import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';

import type {
  FeedItem,
  FeedItemAppSource,
  FeedItemExtensionSource,
  FeedItemId,
  FeedItemRSSSource,
  FeedItemSource,
  FeedItemSourceSchema,
} from '@shared/types/feedItems.types';
import {
  AppFeedItemSourceSchema,
  ExtensionFeedItemSourceSchema,
  FeedItemIdSchema,
  FeedItemSchema,
  FeedItemSourceType,
  RssFeedItemSourceSchema,
} from '@shared/types/feedItems.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {Timestamp} from '@shared/types/utils.types';

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
function parseFeedItemSource(source: z.infer<typeof FeedItemSourceSchema>): Result<FeedItemSource> {
  switch (source.type) {
    case FeedItemSourceType.App:
      return parseAppFeedItemSource(source);
    case FeedItemSourceType.Extension:
      return parseExtensionFeedItemSource(source);
    case FeedItemSourceType.RSS:
      return parseRssFeedItemSource(source);
    default:
      assertNever(source);
  }
}

function parseAppFeedItemSource(source: unknown): Result<FeedItemAppSource> {
  const parsedResult = parseZodResult(AppFeedItemSourceSchema, source);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid app feed item source');
  }
  return makeSuccessResult(parsedResult.value);
}

function parseExtensionFeedItemSource(source: unknown): Result<FeedItemExtensionSource> {
  const parsedResult = parseZodResult(ExtensionFeedItemSourceSchema, source);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid extension feed item source');
  }
  return makeSuccessResult(parsedResult.value);
}

function parseRssFeedItemSource(source: unknown): Result<FeedItemRSSSource> {
  const parsedResult = parseZodResult(RssFeedItemSourceSchema, source);
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
  const parsedFeedItemResult = parseZodResult(FeedItemSchema, maybeFeedItem);
  if (!parsedFeedItemResult.success) {
    return prefixResultIfError(parsedFeedItemResult, 'Invalid feed item');
  }

  const parsedIdResult = parseFeedItemId(parsedFeedItemResult.value.feedItemId);
  if (!parsedIdResult.success) return parsedIdResult;

  const parsedUserIdResult = parseUserId(parsedFeedItemResult.value.userId);
  if (!parsedUserIdResult.success) return parsedUserIdResult;

  const parsedSourceResult = parseFeedItemSource(parsedFeedItemResult.value.source);
  if (!parsedSourceResult.success) return parsedSourceResult;

  const {url, triageStatus, lastImportedTime, createdTime, lastUpdatedTime} =
    parsedFeedItemResult.value;

  return makeSuccessResult({
    type: parsedFeedItemResult.value.type,
    userId: parsedUserIdResult.value,
    source: parsedSourceResult.value,
    feedItemId: parsedIdResult.value,
    url,
    title: 'Test title',
    description: 'Test description',
    outgoingLinks: [],
    triageStatus,
    tagIds: {},
    lastImportedTime: new Date(lastImportedTime) as unknown as Timestamp,
    createdTime: new Date(createdTime) as unknown as Timestamp,
    lastUpdatedTime: new Date(lastUpdatedTime) as unknown as Timestamp,
  });
}
