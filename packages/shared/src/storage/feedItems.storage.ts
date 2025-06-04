import {makeNewFeedItemImportState} from '@shared/lib/feedItems.shared';
import {parseStorageTimestamp} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseFeedSource} from '@shared/parsers/feedSources.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {
  FeedItem,
  FeedItemId,
  FeedItemImportState,
  IntervalFeedItem,
  XkcdFeedItem,
} from '@shared/types/feedItems.types';
import {FeedItemImportStatus, FeedItemType} from '@shared/types/feedItems.types';
import type {Result} from '@shared/types/results.types';

import type {
  BaseFeedItemWithUrlFromStorage,
  FeedItemFromStorage,
  FeedItemImportStateFromStorage,
  IntervalFeedItemFromStorage,
  XkcdFeedItemFromStorage,
} from '@shared/schemas/feedItems.schema';
import {fromStorageIntervalFeedSource} from '@shared/storage/feedSources.storage';

/**
 * Converts a {@link FeedItem} into a {@link FeedItemFromStorage}.
 */
export function toStorageFeedItem(feedItem: FeedItem): FeedItemFromStorage {
  switch (feedItem.feedItemType) {
    case FeedItemType.YouTube:
    case FeedItemType.Article:
    case FeedItemType.Video:
    case FeedItemType.Website:
    case FeedItemType.Tweet:
      return {
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
      };
    case FeedItemType.Xkcd:
      return {
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
      };
    case FeedItemType.Interval:
      return {
        feedItemId: feedItem.feedItemId,
        feedItemType: feedItem.feedItemType,
        feedSource: feedItem.feedSource,
        accountId: feedItem.accountId,
        importState: feedItem.importState,
        title: feedItem.title,
        triageStatus: feedItem.triageStatus,
        tagIds: feedItem.tagIds,
        createdTime: feedItem.createdTime,
        lastUpdatedTime: feedItem.lastUpdatedTime,
      };
    default:
      assertNever(feedItem);
  }
}

/**
 * Converts a {@link FeedItemImportStateFromStorage} into a {@link FeedItemImportState}.
 */
function fromStorageFeedItemImportState(
  feedItemImportState: FeedItemImportStateFromStorage
): Result<FeedItemImportState> {
  const status = feedItemImportState.status;
  switch (status) {
    case FeedItemImportStatus.New:
      return makeSuccessResult(makeNewFeedItemImportState());
    case FeedItemImportStatus.Processing:
      return makeSuccessResult({
        status: FeedItemImportStatus.Processing,
        shouldFetch: false,
        importStartedTime: parseStorageTimestamp(feedItemImportState.importStartedTime),
        lastImportRequestedTime: parseStorageTimestamp(feedItemImportState.lastImportRequestedTime),
        lastSuccessfulImportTime: feedItemImportState.lastSuccessfulImportTime
          ? parseStorageTimestamp(feedItemImportState.lastSuccessfulImportTime)
          : null,
      });
    case FeedItemImportStatus.Failed:
      return makeSuccessResult({
        status: FeedItemImportStatus.Failed,
        shouldFetch: feedItemImportState.shouldFetch,
        errorMessage: feedItemImportState.errorMessage,
        importFailedTime: parseStorageTimestamp(feedItemImportState.importFailedTime),
        lastImportRequestedTime: parseStorageTimestamp(feedItemImportState.lastImportRequestedTime),
        lastSuccessfulImportTime: feedItemImportState.lastSuccessfulImportTime
          ? parseStorageTimestamp(feedItemImportState.lastSuccessfulImportTime)
          : null,
      });
    case FeedItemImportStatus.Completed:
      return makeSuccessResult({
        status: FeedItemImportStatus.Completed,
        shouldFetch: feedItemImportState.shouldFetch,
        lastImportRequestedTime: parseStorageTimestamp(feedItemImportState.lastImportRequestedTime),
        lastSuccessfulImportTime: parseStorageTimestamp(
          feedItemImportState.lastSuccessfulImportTime
        ),
      });
    default:
      assertNever(status);
  }
}

/**
 * Converts a {@link FeedItemFromStorage} into a {@link FeedItem}.
 */
export function fromStorageFeedItem(feedItemFromStorage: FeedItemFromStorage): Result<FeedItem> {
  const parsedIdResult = parseFeedItemId(feedItemFromStorage.feedItemId);
  if (!parsedIdResult.success) return parsedIdResult;

  const parsedAccountIdResult = parseAccountId(feedItemFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedImportStateResult = fromStorageFeedItemImportState(feedItemFromStorage.importState);
  if (!parsedImportStateResult.success) return parsedImportStateResult;

  switch (feedItemFromStorage.feedItemType) {
    case FeedItemType.YouTube:
    case FeedItemType.Article:
    case FeedItemType.Video:
    case FeedItemType.Website:
    case FeedItemType.Tweet:
      return fromStorageFeedItemWithUrl({
        feedItemFromStorage,
        feedItemType: feedItemFromStorage.feedItemType,
        feedItemId: parsedIdResult.value,
        accountId: parsedAccountIdResult.value,
        importState: parsedImportStateResult.value,
      });
    case FeedItemType.Xkcd:
      return parseXkcdFeedItem({
        feedItemFromStorage,
        feedItemId: parsedIdResult.value,
        accountId: parsedAccountIdResult.value,
        importState: parsedImportStateResult.value,
      });
    case FeedItemType.Interval:
      return parseIntervalFeedItem({
        feedItemFromStorage,
        feedItemId: parsedIdResult.value,
        accountId: parsedAccountIdResult.value,
        importState: parsedImportStateResult.value,
      });
    default:
      assertNever(feedItemFromStorage);
  }
}

function fromStorageFeedItemWithUrl(args: {
  // TODO: Sketchy!!!!
  readonly feedItemFromStorage: BaseFeedItemWithUrlFromStorage;
  readonly feedItemType: Exclude<FeedItemType, FeedItemType.Xkcd | FeedItemType.Interval>;
  readonly feedItemId: FeedItemId;
  readonly accountId: AccountId;
  readonly importState: FeedItemImportState;
}): Result<FeedItem> {
  const {feedItemFromStorage, feedItemType, feedItemId, accountId, importState} = args;

  const parseFeedSourceResult = parseFeedSource(feedItemFromStorage.feedSource);
  if (!parseFeedSourceResult.success) return parseFeedSourceResult;
  const parsedFeedSource = parseFeedSourceResult.value;

  return makeSuccessResult({
    feedItemType,
    feedSource: parsedFeedSource,
    accountId,
    importState,
    feedItemId,
    url: feedItemFromStorage.url,
    title: feedItemFromStorage.title,
    description: feedItemFromStorage.description,
    outgoingLinks: feedItemFromStorage.outgoingLinks,
    summary: feedItemFromStorage.summary,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: parseStorageTimestamp(feedItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedItemFromStorage.lastUpdatedTime),
  });
}

export function parseXkcdFeedItem(args: {
  readonly feedItemFromStorage: XkcdFeedItemFromStorage;
  readonly feedItemId: FeedItemId;
  readonly accountId: AccountId;
  readonly importState: FeedItemImportState;
}): Result<XkcdFeedItem> {
  const {feedItemFromStorage, feedItemId, accountId, importState} = args;

  const parsedFeedSourceResult = parseFeedSource(feedItemFromStorage.feedSource);
  if (!parsedFeedSourceResult.success) return parsedFeedSourceResult;
  const parsedFeedSource = parsedFeedSourceResult.value;

  return makeSuccessResult({
    feedItemType: FeedItemType.Xkcd,
    xkcd: feedItemFromStorage.xkcd,
    feedSource: parsedFeedSource,
    accountId,
    importState,
    feedItemId,
    url: feedItemFromStorage.url,
    title: feedItemFromStorage.title,
    description: feedItemFromStorage.description,
    outgoingLinks: feedItemFromStorage.outgoingLinks,
    summary: feedItemFromStorage.summary,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: parseStorageTimestamp(feedItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedItemFromStorage.lastUpdatedTime),
  });
}

export function parseIntervalFeedItem(args: {
  readonly feedItemFromStorage: IntervalFeedItemFromStorage;
  readonly feedItemId: FeedItemId;
  readonly accountId: AccountId;
  readonly importState: FeedItemImportState;
}): Result<IntervalFeedItem> {
  const {feedItemFromStorage, feedItemId, accountId, importState} = args;

  const parsedFeedSourceResult = fromStorageIntervalFeedSource(feedItemFromStorage.feedSource);
  if (!parsedFeedSourceResult.success) return parsedFeedSourceResult;
  const parsedFeedSource = parsedFeedSourceResult.value;

  return makeSuccessResult({
    feedItemType: FeedItemType.Interval,
    feedSource: parsedFeedSource,
    accountId,
    importState,
    feedItemId,
    title: feedItemFromStorage.title,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: parseStorageTimestamp(feedItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedItemFromStorage.lastUpdatedTime),
  });
}
