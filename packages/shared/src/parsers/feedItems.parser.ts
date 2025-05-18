import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {omitUndefined} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseFeedSource} from '@shared/parsers/feedSources.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {
  BaseFeedItemFromStorage,
  CompletedFeedItemImportState,
  FailedFeedItemImportState,
  FeedItem,
  FeedItemFromStorage,
  FeedItemId,
  FeedItemImportState,
  FeedItemImportStateFromStorage,
  FeedSource,
  ProcessingFeedItemImportState,
  XkcdFeedItem,
  XkcdFeedItemFromStorage,
} from '@shared/types/feedItems.types';
import {
  BaseFeedItemFromStorageSchema,
  CompletedFeedItemImportStateSchema,
  FailedFeedItemImportStateSchema,
  FeedItemIdSchema,
  FeedItemImportStatus,
  FeedItemType,
  makeNewFeedItemImportState,
  ProcessingFeedItemImportStateSchema,
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
 * Parses a {@link FeedItemImportState} from an unknown value. Returns an `ErrorResult` if the value
 * is not valid.
 *
 * TODO: I'm not sure if this is the best way to do this. All other parsers take in an `unknown`
 * value instead of a discriminated union.
 */
function parseFeedItemImportState(
  feedItemImportState: FeedItemImportStateFromStorage
): Result<FeedItemImportState> {
  const status = feedItemImportState.status;
  switch (status) {
    case FeedItemImportStatus.New:
      return makeSuccessResult(makeNewFeedItemImportState());
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
  const parsedBaseFeedItemResult = parseZodResult<BaseFeedItemFromStorage>(
    BaseFeedItemFromStorageSchema,
    maybeFeedItem
  );
  if (!parsedBaseFeedItemResult.success) {
    return prefixErrorResult(parsedBaseFeedItemResult, 'Invalid feed item');
  }

  const parsedIdResult = parseFeedItemId(parsedBaseFeedItemResult.value.feedItemId);
  if (!parsedIdResult.success) return parsedIdResult;

  const parsedAccountIdResult = parseAccountId(parsedBaseFeedItemResult.value.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedImportStateResult = parseFeedItemImportState(
    parsedBaseFeedItemResult.value.importState
  );
  if (!parsedImportStateResult.success) return parsedImportStateResult;

  const parseFeedSourceResult = parseFeedSource(parsedBaseFeedItemResult.value.feedSource);
  if (!parseFeedSourceResult.success) return parseFeedSourceResult;
  const parsedFeedSource = parseFeedSourceResult.value;

  switch (parsedBaseFeedItemResult.value.feedItemType) {
    case FeedItemType.YouTube:
    case FeedItemType.Article:
    case FeedItemType.Video:
    case FeedItemType.Website:
    case FeedItemType.Tweet:
      return parseBaseFeedItem({
        feedItemType: parsedBaseFeedItemResult.value.feedItemType,
        storageBaseFeedItem: parsedBaseFeedItemResult.value,
        feedItemId: parsedIdResult.value,
        accountId: parsedAccountIdResult.value,
        importState: parsedImportStateResult.value,
        feedSource: parsedFeedSource,
      });
    case FeedItemType.Xkcd:
      return parseXkcdFeedItem({
        maybeFeedItem,
        feedItemId: parsedIdResult.value,
        accountId: parsedAccountIdResult.value,
        importState: parsedImportStateResult.value,
        feedSource: parsedFeedSource,
      });
    default:
      return makeErrorResult(
        new Error(`Unknown feed item type: ${parsedBaseFeedItemResult.value.feedItemType}`)
      );
  }
}

export function parseBaseFeedItem(args: {
  readonly feedItemType: Exclude<FeedItemType, FeedItemType.Xkcd>;
  readonly storageBaseFeedItem: BaseFeedItemFromStorage;
  readonly feedItemId: FeedItemId;
  readonly accountId: AccountId;
  readonly importState: FeedItemImportState;
  readonly feedSource: FeedSource;
}): Result<FeedItem> {
  const {feedItemType, storageBaseFeedItem, feedItemId, feedSource, accountId, importState} = args;

  return makeSuccessResult(
    omitUndefined({
      feedItemType,
      feedSource,
      accountId,
      importState,
      feedItemId,
      url: storageBaseFeedItem.url,
      title: storageBaseFeedItem.title,
      description: storageBaseFeedItem.description,
      outgoingLinks: storageBaseFeedItem.outgoingLinks,
      summary: storageBaseFeedItem.summary,
      triageStatus: storageBaseFeedItem.triageStatus,
      tagIds: storageBaseFeedItem.tagIds,
      createdTime: parseStorageTimestamp(storageBaseFeedItem.createdTime),
      lastUpdatedTime: parseStorageTimestamp(storageBaseFeedItem.lastUpdatedTime),
    })
  );
}

export function parseXkcdFeedItem(args: {
  readonly maybeFeedItem: unknown;
  readonly feedItemId: FeedItemId;
  readonly accountId: AccountId;
  readonly importState: FeedItemImportState;
  readonly feedSource: FeedSource;
}): Result<FeedItem> {
  const {maybeFeedItem, feedItemId, accountId, importState, feedSource} = args;

  const parsedXkcdFeedItemResult = parseZodResult(XkcdFeedItemFromStorageSchema, maybeFeedItem);
  if (!parsedXkcdFeedItemResult.success) {
    return prefixErrorResult(parsedXkcdFeedItemResult, 'Invalid XKCD feed item');
  }
  const storageXkcdFeedItem = parsedXkcdFeedItemResult.value;

  return makeSuccessResult(
    omitUndefined({
      feedItemType: FeedItemType.Xkcd,
      xkcd: parsedXkcdFeedItemResult.value.xkcd,
      feedSource,
      accountId,
      importState,
      feedItemId,
      url: storageXkcdFeedItem.url,
      title: storageXkcdFeedItem.title,
      description: storageXkcdFeedItem.description,
      outgoingLinks: storageXkcdFeedItem.outgoingLinks,
      summary: storageXkcdFeedItem.summary,
      triageStatus: storageXkcdFeedItem.triageStatus,
      tagIds: storageXkcdFeedItem.tagIds,
      createdTime: parseStorageTimestamp(storageXkcdFeedItem.createdTime),
      lastUpdatedTime: parseStorageTimestamp(storageXkcdFeedItem.lastUpdatedTime),
    })
  );
}

/**
 * Converts a {@link FeedItem} to a {@link FeedItemFromStorage} object that can be persisted to
 * Firestore.
 */
export function toStorageFeedItem(feedItem: FeedItem): FeedItemFromStorage {
  switch (feedItem.feedItemType) {
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
    feedItemType: feedItem.feedItemType,
    feedSource: feedItem.feedSource,
    accountId: feedItem.accountId,
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
    feedItemType: feedItem.feedItemType,
    feedSource: feedItem.feedSource,
    accountId: feedItem.accountId,
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
