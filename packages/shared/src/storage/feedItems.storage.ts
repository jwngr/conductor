import {makeNewFeedItemImportState} from '@shared/lib/feedItems.shared';
import {parseStorageTimestamp} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseFeedSource} from '@shared/parsers/feedSources.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {
  ArticleFeedItem,
  FeedItem,
  FeedItemId,
  FeedItemImportState,
  FeedItemWithUrlContent,
  IntervalFeedItem,
  IntervalFeedItemContent,
  TriageStatus,
  TweetFeedItem,
  VideoFeedItem,
  WebsiteFeedItem,
  XkcdFeedItem,
  XkcdFeedItemContent,
  YouTubeFeedItem,
} from '@shared/types/feedItems.types';
import {FeedItemContentType, FeedItemImportStatus} from '@shared/types/feedItems.types';
import type {FeedSource} from '@shared/types/feedSources.types';
import type {Result} from '@shared/types/results.types';

import type {
  ArticleFeedItemFromStorage,
  FeedItemFromStorage,
  FeedItemImportStateFromStorage,
  FeedItemWithUrlContentFromStorage,
  IntervalFeedItemContentFromStorage,
  IntervalFeedItemFromStorage,
  TweetFeedItemFromStorage,
  VideoFeedItemFromStorage,
  WebsiteFeedItemFromStorage,
  XkcdFeedItemContentFromStorage,
  XkcdFeedItemFromStorage,
  YouTubeFeedItemFromStorage,
} from '@shared/schemas/feedItems.schema';
import {toStorageFeedSource} from '@shared/storage/feedSources.storage';

/////////////////
//  FEED ITEM  //
/////////////////
/**
 * Converts a {@link FeedItem} into a {@link FeedItemFromStorage}.
 */
export function toStorageFeedItem(feedItem: FeedItem): FeedItemFromStorage {
  switch (feedItem.feedItemContentType) {
    case FeedItemContentType.Article:
      return toStorageArticleFeedItem(feedItem);
    case FeedItemContentType.Video:
      return toStorageVideoFeedItem(feedItem);
    case FeedItemContentType.Website:
      return toStorageWebsiteFeedItem(feedItem);
    case FeedItemContentType.Tweet:
      return toStorageTweetFeedItem(feedItem);
    case FeedItemContentType.YouTube:
      return toStorageYouTubeFeedItem(feedItem);
    case FeedItemContentType.Xkcd:
      return toStorageXkcdFeedItem(feedItem);
    case FeedItemContentType.Interval:
      return toStorageIntervalFeedItem(feedItem);
    default:
      assertNever(feedItem);
  }
}

function toStorageArticleFeedItem(feedItem: ArticleFeedItem): ArticleFeedItemFromStorage {
  return {
    feedItemId: feedItem.feedItemId,
    feedItemContentType: FeedItemContentType.Article,
    content: toStorageFeedItemWithUrlContent(feedItem.content),
    feedSource: toStorageFeedSource(feedItem.feedSource),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

function toStorageVideoFeedItem(feedItem: VideoFeedItem): VideoFeedItemFromStorage {
  return {
    feedItemId: feedItem.feedItemId,
    feedItemContentType: FeedItemContentType.Video,
    content: toStorageFeedItemWithUrlContent(feedItem.content),
    feedSource: toStorageFeedSource(feedItem.feedSource),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

function toStorageWebsiteFeedItem(feedItem: WebsiteFeedItem): WebsiteFeedItemFromStorage {
  return {
    feedItemId: feedItem.feedItemId,
    feedItemContentType: FeedItemContentType.Website,
    content: toStorageFeedItemWithUrlContent(feedItem.content),
    feedSource: toStorageFeedSource(feedItem.feedSource),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

function toStorageTweetFeedItem(feedItem: TweetFeedItem): TweetFeedItemFromStorage {
  return {
    feedItemId: feedItem.feedItemId,
    feedItemContentType: FeedItemContentType.Tweet,
    content: toStorageFeedItemWithUrlContent(feedItem.content),
    feedSource: toStorageFeedSource(feedItem.feedSource),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

function toStorageYouTubeFeedItem(feedItem: YouTubeFeedItem): YouTubeFeedItemFromStorage {
  return {
    feedItemId: feedItem.feedItemId,
    feedItemContentType: FeedItemContentType.YouTube,
    content: toStorageFeedItemWithUrlContent(feedItem.content),
    feedSource: toStorageFeedSource(feedItem.feedSource),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

function toStorageXkcdFeedItem(feedItem: XkcdFeedItem): XkcdFeedItemFromStorage {
  return {
    feedItemId: feedItem.feedItemId,
    feedItemContentType: FeedItemContentType.Xkcd,
    feedSource: toStorageFeedSource(feedItem.feedSource),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    content: toStorageXkcdFeedItemContent(feedItem.content),
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

function toStorageIntervalFeedItem(feedItem: IntervalFeedItem): IntervalFeedItemFromStorage {
  return {
    feedItemId: feedItem.feedItemId,
    feedItemContentType: FeedItemContentType.Interval,
    content: toStorageIntervalFeedItemContent(feedItem.content),
    feedSource: toStorageFeedSource(feedItem.feedSource),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

/**
 * Converts a {@link FeedItemFromStorage} into a {@link FeedItem}.
 */
export function fromStorageFeedItem(feedItemFromStorage: FeedItemFromStorage): Result<FeedItem> {
  switch (feedItemFromStorage.feedItemContentType) {
    case FeedItemContentType.Article:
      return fromStorageArticleFeedItem(feedItemFromStorage);
    case FeedItemContentType.Video:
      return fromStorageVideoFeedItem(feedItemFromStorage);
    case FeedItemContentType.Website:
      return fromStorageWebsiteFeedItem(feedItemFromStorage);
    case FeedItemContentType.Tweet:
      return fromStorageTweetFeedItem(feedItemFromStorage);
    case FeedItemContentType.YouTube:
      return fromStorageYouTubeFeedItem(feedItemFromStorage);
    case FeedItemContentType.Xkcd:
      return fromStorageXkcdFeedItem(feedItemFromStorage);
    case FeedItemContentType.Interval:
      return fromStorageIntervalFeedItem(feedItemFromStorage);
    default:
      assertNever(feedItemFromStorage);
  }
}

function fromStorageFeedItemShared(feedItemFromStorage: FeedItemFromStorage): Result<{
  readonly feedItemId: FeedItemId;
  readonly accountId: AccountId;
  readonly importState: FeedItemImportState;
  readonly feedSource: FeedSource;
  readonly feedItemContentType: FeedItemContentType;
  readonly triageStatus: TriageStatus;
}> {
  const parsedFeedItemIdResult = parseFeedItemId(feedItemFromStorage.feedItemId);
  if (!parsedFeedItemIdResult.success) return parsedFeedItemIdResult;

  const parsedAccountIdResult = parseAccountId(feedItemFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedImportStateResult = fromStorageFeedItemImportState(feedItemFromStorage.importState);
  if (!parsedImportStateResult.success) return parsedImportStateResult;

  const parsedFeedSourceResult = parseFeedSource(feedItemFromStorage.feedSource);
  if (!parsedFeedSourceResult.success) return parsedFeedSourceResult;

  return makeSuccessResult({
    feedItemId: parsedFeedItemIdResult.value,
    accountId: parsedAccountIdResult.value,
    importState: parsedImportStateResult.value,
    feedSource: parsedFeedSourceResult.value,
    feedItemContentType: feedItemFromStorage.feedItemContentType,
    triageStatus: feedItemFromStorage.triageStatus,
  });
}

function fromStorageArticleFeedItem(
  feedItemFromStorage: ArticleFeedItemFromStorage
): Result<ArticleFeedItem> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, feedSource} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageFeedItemWithUrlContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Article,
    feedItemId,
    feedSource,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: feedItemFromStorage.createdTime,
    lastUpdatedTime: feedItemFromStorage.lastUpdatedTime,
  });
}

function fromStorageVideoFeedItem(
  feedItemFromStorage: VideoFeedItemFromStorage
): Result<VideoFeedItem> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, feedSource} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageFeedItemWithUrlContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Video,
    feedItemId,
    feedSource,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: feedItemFromStorage.createdTime,
    lastUpdatedTime: feedItemFromStorage.lastUpdatedTime,
  });
}

function fromStorageWebsiteFeedItem(
  feedItemFromStorage: WebsiteFeedItemFromStorage
): Result<WebsiteFeedItem> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, feedSource} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageFeedItemWithUrlContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Website,
    feedItemId,
    feedSource,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: feedItemFromStorage.createdTime,
    lastUpdatedTime: feedItemFromStorage.lastUpdatedTime,
  });
}

function fromStorageTweetFeedItem(
  feedItemFromStorage: TweetFeedItemFromStorage
): Result<TweetFeedItem> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, feedSource} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageFeedItemWithUrlContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Tweet,
    feedItemId,
    feedSource,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: feedItemFromStorage.createdTime,
    lastUpdatedTime: feedItemFromStorage.lastUpdatedTime,
  });
}

function fromStorageYouTubeFeedItem(
  feedItemFromStorage: YouTubeFeedItemFromStorage
): Result<YouTubeFeedItem> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, feedSource} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageFeedItemWithUrlContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.YouTube,
    feedItemId,
    feedSource,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: feedItemFromStorage.createdTime,
    lastUpdatedTime: feedItemFromStorage.lastUpdatedTime,
  });
}

function fromStorageXkcdFeedItem(
  feedItemFromStorage: XkcdFeedItemFromStorage
): Result<XkcdFeedItem> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, feedSource} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageXkcdFeedItemContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Xkcd,
    feedItemId,
    feedSource,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: feedItemFromStorage.createdTime,
    lastUpdatedTime: feedItemFromStorage.lastUpdatedTime,
  });
}

function fromStorageIntervalFeedItem(
  feedItemFromStorage: IntervalFeedItemFromStorage
): Result<IntervalFeedItem> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, feedSource} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageIntervalFeedItemContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Interval,
    feedItemId,
    feedSource,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: feedItemFromStorage.createdTime,
    lastUpdatedTime: feedItemFromStorage.lastUpdatedTime,
  });
}

/////////////////////////
//  FEED ITEM CONTENT  //
/////////////////////////
function toStorageXkcdFeedItemContent(
  feedItemContent: XkcdFeedItemContent
): XkcdFeedItemContentFromStorage {
  return {
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
    title: feedItemContent.title,
    intervalSeconds: feedItemContent.intervalSeconds,
  };
}

function toStorageFeedItemWithUrlContent(
  feedItemContent: FeedItemWithUrlContent
): FeedItemWithUrlContentFromStorage {
  return {
    title: feedItemContent.title,
    url: feedItemContent.url,
    description: feedItemContent.description,
    summary: feedItemContent.summary,
    outgoingLinks: feedItemContent.outgoingLinks,
  };
}

function fromStorageXkcdFeedItemContent(
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

function fromStorageIntervalFeedItemContent(
  feedItemContentFromStorage: IntervalFeedItemContentFromStorage
): Result<IntervalFeedItemContent> {
  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Interval,
    title: feedItemContentFromStorage.title,
    intervalSeconds: feedItemContentFromStorage.intervalSeconds,
  });
}

function fromStorageFeedItemWithUrlContent(
  feedItemContentFromStorage: FeedItemWithUrlContentFromStorage
): Result<FeedItemWithUrlContent> {
  return makeSuccessResult({
    title: feedItemContentFromStorage.title,
    url: feedItemContentFromStorage.url,
    description: feedItemContentFromStorage.description,
    summary: feedItemContentFromStorage.summary,
    outgoingLinks: feedItemContentFromStorage.outgoingLinks,
  });
}

//////////////////////////////
//  FEED ITEM IMPORT STATE  //
//////////////////////////////
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
