import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseUserFeedSubscriptionId} from '@shared/parsers/userFeedSubscriptions.parser';

import type {
  BaseFeedItemFromStorage,
  CompletedFeedItemImportState,
  FailedFeedItemImportState,
  FeedItem,
  FeedItemAppSource,
  FeedItemExtensionSource,
  FeedItemFromStorage,
  FeedItemId,
  FeedItemImportState,
  FeedItemImportStateFromStorage,
  FeedItemPocketExportSource,
  FeedItemRSSSource,
  FeedItemSource,
  FeedItemSourceFromStorage,
  NewFeedItemImportState,
  ProcessingFeedItemImportState,
  XkcdFeedItem,
  XkcdFeedItemFromStorage,
} from '@shared/types/feedItems.types';
import {
  AppFeedItemSourceSchema,
  BaseFeedItemFromStorageSchema,
  CompletedFeedItemImportStateSchema,
  ExtensionFeedItemSourceSchema,
  FailedFeedItemImportStateSchema,
  FeedItemIdSchema,
  FeedItemImportStatus,
  FeedItemSourceType,
  FeedItemType,
  makeNewFeedItemImportState,
  NewFeedItemImportStateSchema,
  PocketExportFeedItemSourceSchema,
  ProcessingFeedItemImportStateSchema,
  RssFeedItemSourceSchema,
  XkcdFeedItemFromStorageSchema,
} from '@shared/types/feedItems.types';
import type {Result} from '@shared/types/results.types';

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
    case FeedItemSourceType.PocketExport:
      return parsePocketExportFeedItemSource(feedItemSource);
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
 * Parses a {@link FeedItemPocketExportSource} from an unknown value. Returns an `ErrorResult` if
 * the value is not valid.
 */
function parsePocketExportFeedItemSource(
  feedItemSource: unknown
): Result<FeedItemPocketExportSource> {
  const parsedResult = parseZodResult(PocketExportFeedItemSourceSchema, feedItemSource);
  return prefixResultIfError(parsedResult, 'Invalid pocket export feed item source');
}

/**
 * Parses a {@link FeedItemSource} from an unknown value. Returns an `ErrorResult` if the value is
 * not valid.
 */
// TODO: I'm not sure if this is the best way to do this. All other parsers take in an `unknown`
// value instead of a discriminated union.
function parseFeedItemImportState(
  feedItemImportState: FeedItemImportStateFromStorage
): Result<FeedItemImportState> {
  const status = feedItemImportState.status;
  switch (status) {
    case FeedItemImportStatus.New:
      return parseNewFeedItemImportState(feedItemImportState);
    case FeedItemImportStatus.Processing:
      return parseProcessingFeedItemImportState(feedItemImportState);
    case FeedItemImportStatus.Failed:
      return parseFailedFeedItemImportState(feedItemImportState);
    case FeedItemImportStatus.Completed:
      return parseCompletedFeedItemImportState(feedItemImportState);
    default:
      return makeErrorResult(new Error(`Unknown feed item import status: ${status}`));
  }
}

/**
 * Parses a {@link NewFeedItemImportState} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
function parseNewFeedItemImportState(feedItemImportState: unknown): Result<NewFeedItemImportState> {
  const parsedResult = parseZodResult(NewFeedItemImportStateSchema, feedItemImportState);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid new feed item import state');
  }
  return makeSuccessResult(makeNewFeedItemImportState());
}

/**
 * Parses a {@link FeedItemExtensionSource} from an unknown value. Returns an `ErrorResult` if the
 * value is not valid.
 */
function parseProcessingFeedItemImportState(
  feedItemImportState: unknown
): Result<ProcessingFeedItemImportState> {
  const parsedResult = parseZodResult(ProcessingFeedItemImportStateSchema, feedItemImportState);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid processing feed item import state');
  }
  return makeSuccessResult({
    status: FeedItemImportStatus.Processing,
    shouldFetch: false,
    importStartedTime: parseStorageTimestamp(parsedResult.value.importStartedTime),
    lastImportRequestedTime: parseStorageTimestamp(parsedResult.value.lastImportRequestedTime),
    lastSuccessfulImportTime: parsedResult.value.lastSuccessfulImportTime
      ? parseStorageTimestamp(parsedResult.value.lastSuccessfulImportTime)
      : null,
  });
}

/**
 * Parses a {@link FailedFeedItemImportState} from an unknown value. Returns an `ErrorResult` if
 * the value is not valid.
 */
function parseFailedFeedItemImportState(
  feedItemImportState: unknown
): Result<FailedFeedItemImportState> {
  const parsedResult = parseZodResult(FailedFeedItemImportStateSchema, feedItemImportState);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid failed feed item import state');
  }
  return makeSuccessResult({
    status: FeedItemImportStatus.Failed,
    shouldFetch: parsedResult.value.shouldFetch,
    errorMessage: parsedResult.value.errorMessage,
    importFailedTime: parseStorageTimestamp(parsedResult.value.importFailedTime),
    lastImportRequestedTime: parseStorageTimestamp(parsedResult.value.lastImportRequestedTime),
    lastSuccessfulImportTime: parsedResult.value.lastSuccessfulImportTime
      ? parseStorageTimestamp(parsedResult.value.lastSuccessfulImportTime)
      : null,
  });
}

/**
 * Parses a {@link CompletedFeedItemImportState} from an unknown value. Returns an `ErrorResult` if
 * the value is not valid.
 */
function parseCompletedFeedItemImportState(
  feedItemImportState: unknown
): Result<CompletedFeedItemImportState> {
  const parsedResult = parseZodResult(CompletedFeedItemImportStateSchema, feedItemImportState);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid completed feed item import state');
  }
  return makeSuccessResult({
    status: FeedItemImportStatus.Completed,
    shouldFetch: parsedResult.value.shouldFetch,
    lastImportRequestedTime: parseStorageTimestamp(parsedResult.value.lastImportRequestedTime),
    lastSuccessfulImportTime: parseStorageTimestamp(parsedResult.value.lastSuccessfulImportTime),
  });
}

/**
 * Parses a {@link FeedItem} from an unknown value. Returns an `ErrorResult` if the value is not
 * valid.
 */
export function parseFeedItem(maybeFeedItem: unknown): Result<FeedItem> {
  const parsedFeedItemResult = parseZodResult(BaseFeedItemFromStorageSchema, maybeFeedItem);
  if (!parsedFeedItemResult.success) {
    return prefixErrorResult(parsedFeedItemResult, 'Invalid feed item');
  }

  const parsedIdResult = parseFeedItemId(parsedFeedItemResult.value.feedItemId);
  if (!parsedIdResult.success) return parsedIdResult;

  const parsedAccountIdReult = parseAccountId(parsedFeedItemResult.value.accountId);
  if (!parsedAccountIdReult.success) return parsedAccountIdReult;

  const parsedSourceResult = parseFeedItemSource(parsedFeedItemResult.value.feedItemSource);
  if (!parsedSourceResult.success) return parsedSourceResult;

  const parsedImportStateResult = parseFeedItemImportState(parsedFeedItemResult.value.importState);
  if (!parsedImportStateResult.success) return parsedImportStateResult;

  switch (parsedFeedItemResult.value.type) {
    case FeedItemType.Xkcd: {
      const parsedXkcdFeedItemResult = parseZodResult(XkcdFeedItemFromStorageSchema, maybeFeedItem);
      if (!parsedXkcdFeedItemResult.success) {
        return prefixErrorResult(parsedXkcdFeedItemResult, 'Invalid feed item');
      }

      return makeSuccessResult(
        omitUndefined({
          type: FeedItemType.Xkcd,
          xkcd: parsedXkcdFeedItemResult.value.xkcd,
          accountId: parsedAccountIdReult.value,
          feedItemSource: parsedSourceResult.value,
          importState: parsedImportStateResult.value,
          feedItemId: parsedIdResult.value,
          url: parsedFeedItemResult.value.url,
          title: parsedFeedItemResult.value.title,
          description: parsedFeedItemResult.value.description,
          outgoingLinks: parsedFeedItemResult.value.outgoingLinks,
          summary: parsedFeedItemResult.value.summary,
          triageStatus: parsedFeedItemResult.value.triageStatus,
          tagIds: parsedFeedItemResult.value.tagIds,
          createdTime: parseStorageTimestamp(parsedFeedItemResult.value.createdTime),
          lastUpdatedTime: parseStorageTimestamp(parsedFeedItemResult.value.lastUpdatedTime),
        })
      );
    }
    case FeedItemType.YouTube:
    case FeedItemType.Article:
    case FeedItemType.Video:
    case FeedItemType.Website:
    case FeedItemType.Tweet:
    default:
      return makeSuccessResult(
        omitUndefined({
          type: parsedFeedItemResult.value.type,
          accountId: parsedAccountIdReult.value,
          feedItemSource: parsedSourceResult.value,
          importState: parsedImportStateResult.value,
          feedItemId: parsedIdResult.value,
          url: parsedFeedItemResult.value.url,
          title: parsedFeedItemResult.value.title,
          description: parsedFeedItemResult.value.description,
          outgoingLinks: parsedFeedItemResult.value.outgoingLinks,
          summary: parsedFeedItemResult.value.summary,
          triageStatus: parsedFeedItemResult.value.triageStatus,
          tagIds: parsedFeedItemResult.value.tagIds,
          createdTime: parseStorageTimestamp(parsedFeedItemResult.value.createdTime),
          lastUpdatedTime: parseStorageTimestamp(parsedFeedItemResult.value.lastUpdatedTime),
        })
      );
  }
}

/**
 * Converts a {@link FeedItem} to a {@link FeedItemFromStorage} object that can be persisted to
 * Firestore.
 */
export function toStorageFeedItem(feedItem: FeedItem): FeedItemFromStorage {
  switch (feedItem.type) {
    case FeedItemType.Xkcd:
      return toStorageXkcdFeedItem(feedItem);
    case FeedItemType.YouTube:
    case FeedItemType.Article:
    case FeedItemType.Video:
    case FeedItemType.Website:
    case FeedItemType.Tweet:
      return toStorageBaseFeedItem(feedItem);
    default:
      logger.error(new Error('Unknown feed item type'), {feedItem});
      return toStorageBaseFeedItem(feedItem);
  }
}

/**
 * Converts an {@link BaseFeedItem} to a {@link BaseFeedItemFromStorage} object that can be
 * persisted to Firestore.
 */
export function toStorageBaseFeedItem(
  feedItem: Exclude<FeedItem, XkcdFeedItem>
): BaseFeedItemFromStorage {
  return omitUndefined({
    feedItemId: feedItem.feedItemId,
    accountId: feedItem.accountId,
    type: feedItem.type,
    feedItemSource: feedItem.feedItemSource,
    importState: feedItem.importState,
    url: feedItem.url,
    title: feedItem.title,
    description: feedItem.description,
    outgoingLinks: feedItem.outgoingLinks,
    summary: feedItem.summary,
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  });
}

/**
 * Converts an {@link XkcdFeedItem} to a {@link XkcdFeedItemFromStorage} object that can be
 * persisted to Firestore.
 */
export function toStorageXkcdFeedItem(feedItem: XkcdFeedItem): XkcdFeedItemFromStorage {
  return omitUndefined({
    feedItemId: feedItem.feedItemId,
    accountId: feedItem.accountId,
    type: feedItem.type,
    feedItemSource: feedItem.feedItemSource,
    importState: feedItem.importState,
    url: feedItem.url,
    title: feedItem.title,
    description: feedItem.description,
    outgoingLinks: feedItem.outgoingLinks,
    summary: feedItem.summary,
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
    xkcd: feedItem.xkcd,
  });
}
