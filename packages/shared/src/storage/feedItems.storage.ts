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
  FeedItemContent,
  FeedItemId,
  FeedItemImportState,
  IntervalFeedItem,
  IntervalFeedItemContent,
  XkcdFeedItemContent,
} from '@shared/types/feedItems.types';
import {FeedItemContentType, FeedItemImportStatus} from '@shared/types/feedItems.types';
import type {Result} from '@shared/types/results.types';

import type {
  FeedItemContentFromStorage,
  FeedItemFromStorage,
  FeedItemImportStateFromStorage,
  IntervalFeedItemContentFromStorage,
  IntervalFeedItemFromStorage,
  XkcdFeedItemContentFromStorage,
  XkcdFeedItemFromStorage,
} from '@shared/schemas/feedItems.schema';
import {
  fromStorageIntervalFeedSource,
  toStorageIntervalFeedSource,
} from '@shared/storage/feedSources.storage';

//////////////////
///  FEED ITEM  //
//////////////////

/**
 * Converts a {@link FeedItem} into a {@link FeedItemFromStorage}.
 */
export function toStorageFeedItem(feedItem: FeedItem): FeedItemFromStorage {
  switch (feedItem.content.feedItemContentType) {
    case FeedItemContentType.YouTube:
    case FeedItemContentType.Article:
    case FeedItemContentType.Video:
    case FeedItemContentType.Website:
    case FeedItemContentType.Tweet:
      return {
        feedItemId: feedItem.feedItemId,
        feedSource: feedItem.feedSource,
        accountId: feedItem.accountId,
        importState: feedItem.importState,
        content: toStorageFeedItemContent(feedItem.content),
        triageStatus: feedItem.triageStatus,
        tagIds: feedItem.tagIds,
        createdTime: feedItem.createdTime,
        lastUpdatedTime: feedItem.lastUpdatedTime,
      };
    case FeedItemContentType.Xkcd:
      return {
        feedItemId: feedItem.feedItemId,
        feedSource: feedItem.feedSource,
        accountId: feedItem.accountId,
        importState: feedItem.importState,
        content: toStorageFeedItemContent(feedItem.content),
        triageStatus: feedItem.triageStatus,
        tagIds: feedItem.tagIds,
        createdTime: feedItem.createdTime,
        lastUpdatedTime: feedItem.lastUpdatedTime,
      };
    case FeedItemContentType.Interval:
      return toStorageIntervalFeedItem(feedItem);
    default:
      assertNever(feedItem.content);
  }
}

function toStorageIntervalFeedItem(feedItem: IntervalFeedItem): FeedItemFromStorage {
  return {
    feedItemId: feedItem.feedItemId,
    feedSource: toStorageIntervalFeedSource(feedItem.feedSource),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    content: toStorageIntervalFeedItemContent(feedItem.content),
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
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
    case FeedItemContentType.YouTube:
    case FeedItemContentType.Article:
    case FeedItemContentType.Video:
    case FeedItemContentType.Website:
    case FeedItemContentType.Tweet:
      return fromStorageFeedItemWithUrl({
        feedItemFromStorage,
        feedItemType: feedItemFromStorage.feedItemType,
        feedItemId: parsedIdResult.value,
        accountId: parsedAccountIdResult.value,
        importState: parsedImportStateResult.value,
      });
    case FeedItemContentType.Xkcd:
      return parseXkcdFeedItem({
        feedItemFromStorage,
        feedItemId: parsedIdResult.value,
        accountId: parsedAccountIdResult.value,
        importState: parsedImportStateResult.value,
      });
    case FeedItemContentType.Interval:
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

//////////////////////////
///  FEED ITEM CONTENT  //
//////////////////////////

/**
 * Converts a {@link FeedItemContent} into a {@link FeedItemContentFromStorage}.
 */
export function toStorageFeedItemContent(
  feedItemContent: FeedItemContent
): FeedItemContentFromStorage {
  switch (feedItemContent.feedItemContentType) {
    case FeedItemContentType.Xkcd:
      return toStorageXkcdFeedItemContent(feedItemContent);
    case FeedItemContentType.Interval:
      return toStorageIntervalFeedItemContent(feedItemContent);
    case FeedItemContentType.Article:
    case FeedItemContentType.Video:
    case FeedItemContentType.Website:
    case FeedItemContentType.Tweet:
    case FeedItemContentType.YouTube:
      return {
        feedItemContentType: feedItemContent.feedItemContentType,
        title: feedItemContent.title,
        url: feedItemContent.url,
        description: feedItemContent.description,
        summary: feedItemContent.summary,
        outgoingLinks: feedItemContent.outgoingLinks,
      };
    default:
      assertNever(feedItemContent);
  }
}

function toStorageXkcdFeedItemContent(
  feedItemContent: XkcdFeedItemContent
): XkcdFeedItemContentFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Xkcd,
    title: feedItemContent.title,
    url: feedItemContent.url,
    description: feedItemContent.description,
    summary: feedItemContent.summary,
    outgoingLinks: feedItemContent.outgoingLinks,
    altText: feedItemContent.altText,
    imageUrlSmall: feedItemContent.imageUrlSmall,
    imageUrlLarge: feedItemContent.imageUrlLarge,
  };
}

function toStorageIntervalFeedItemContent(
  feedItemContent: IntervalFeedItemContent
): IntervalFeedItemContentFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Interval,
    title: feedItemContent.title,
    intervalSeconds: feedItemContent.intervalSeconds,
  };
}

/**
 * Converts a {@link FeedItemContentFromStorage} into a {@link FeedItemContent}.
 */
export function fromStorageFeedItemContent(
  feedItemContentFromStorage: FeedItemContentFromStorage
): Result<FeedItemContent> {
  switch (feedItemContentFromStorage.feedItemContentType) {
    case FeedItemContentType.Xkcd:
      return fromStorageXkcdFeedItemContent(feedItemContentFromStorage);
    case FeedItemContentType.Interval:
      return fromStorageIntervalFeedItemContent(feedItemContentFromStorage);
    case FeedItemContentType.Article:
    case FeedItemContentType.Video:
    case FeedItemContentType.Website:
    case FeedItemContentType.Tweet:
    case FeedItemContentType.YouTube:
      return fromStorageFeedItemContentWithUrl(feedItemContentFromStorage);
    default:
      assertNever(feedItemContentFromStorage);
  }
}

export function fromStorageXkcdFeedItemContent(
  feedItemContentFromStorage: XkcdFeedItemContentFromStorage
): Result<XkcdFeedItemContent> {
  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Xkcd,
    title: feedItemContentFromStorage.title,
    url: feedItemContentFromStorage.url,
    description: feedItemContentFromStorage.description,
    summary: feedItemContentFromStorage.summary,
    outgoingLinks: feedItemContentFromStorage.outgoingLinks,
    altText: feedItemContentFromStorage.altText,
    imageUrlSmall: feedItemContentFromStorage.imageUrlSmall,
    imageUrlLarge: feedItemContentFromStorage.imageUrlLarge,
  });
}

export function fromStorageIntervalFeedItemContent(
  feedItemContentFromStorage: IntervalFeedItemContentFromStorage
): Result<IntervalFeedItemContent> {
  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Interval,
    title: feedItemContentFromStorage.title,
    intervalSeconds: feedItemContentFromStorage.intervalSeconds,
  });
}

export function fromStorageFeedItemContentWithUrl(
  feedItemContentFromStorage: Exclude<
    FeedItemContentFromStorage,
    XkcdFeedItemContentFromStorage | IntervalFeedItemContentFromStorage
  >
): Result<Exclude<FeedItemContent, XkcdFeedItemContent | IntervalFeedItemContent>> {
  return makeSuccessResult({
    feedItemContentType: feedItemContentFromStorage.feedItemContentType,
    title: feedItemContentFromStorage.title,
    url: feedItemContentFromStorage.url,
    description: feedItemContentFromStorage.description,
    summary: feedItemContentFromStorage.summary,
    outgoingLinks: feedItemContentFromStorage.outgoingLinks,
  });
}

// CHOPPING BLOCK
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
    feedItemType: FeedItemContentType.Xkcd,
    feedSource: parsedFeedSource,
    accountId,
    importState,
    feedItemId,
    contentData: fromStorageContentData(
      feedItemFromStorage.contentData
    ) as XkcdFeedItem['contentData'],
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
    feedItemType: FeedItemContentType.Interval,
    feedSource: parsedFeedSource,
    accountId,
    importState,
    feedItemId,
    contentData: fromStorageContentData(
      feedItemFromStorage.contentData
    ) as IntervalFeedItem['contentData'],
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: parseStorageTimestamp(feedItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedItemFromStorage.lastUpdatedTime),
  });
}
