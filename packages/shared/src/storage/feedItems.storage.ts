import {makeNewFeedItemImportState} from '@shared/lib/feedItems.shared';
import {parseStorageTimestamp} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseFeed} from '@shared/parsers/feeds.parser';

import {FeedItemContentType} from '@shared/types/feedItemContent.types';
import type {FeedItemImportState} from '@shared/types/feedItemImportStates';
import {FeedItemImportStatus} from '@shared/types/feedItemImportStates';
import type {
  ArticleFeedItem,
  FeedItem,
  IntervalFeedItem,
  TriageStatus,
  TweetFeedItem,
  VideoFeedItem,
  WebsiteFeedItem,
  XkcdFeedItem,
  YouTubeFeedItem,
} from '@shared/types/feedItems.types';
import type {Feed} from '@shared/types/feeds.types';
import type {AccountId, FeedItemId} from '@shared/types/ids.types';
import type {Result} from '@shared/types/results.types';

import type {FeedItemImportStateFromStorage} from '@shared/schemas/feedItemImportStates.schema';
import type {
  ArticleFeedItemFromStorage,
  FeedItemFromStorage,
  IntervalFeedItemFromStorage,
  TweetFeedItemFromStorage,
  VideoFeedItemFromStorage,
  WebsiteFeedItemFromStorage,
  XkcdFeedItemFromStorage,
  YouTubeFeedItemFromStorage,
} from '@shared/schemas/feedItems.schema';
import {
  fromStorageArticleFeedItemContent,
  fromStorageIntervalFeedItemContent,
  fromStorageTweetFeedItemContent,
  fromStorageVideoFeedItemContent,
  fromStorageWebsiteFeedItemContent,
  fromStorageXkcdFeedItemContent,
  fromStorageYouTubeFeedItemContent,
  toStorageArticleFeedItemContent,
  toStorageIntervalFeedItemContent,
  toStorageTweetFeedItemContent,
  toStorageVideoFeedItemContent,
  toStorageWebsiteFeedItemContent,
  toStorageXkcdFeedItemContent,
  toStorageYouTubeFeedItemContent,
} from '@shared/storage/feedItemContent.storage';
import {toStorageFeed} from '@shared/storage/feeds.storage';

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
    feedItemContentType: FeedItemContentType.Article,
    feedItemId: feedItem.feedItemId,
    origin: toStorageFeed(feedItem.origin),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    content: toStorageArticleFeedItemContent(feedItem.content),
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

function toStorageVideoFeedItem(feedItem: VideoFeedItem): VideoFeedItemFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Video,
    feedItemId: feedItem.feedItemId,
    origin: toStorageFeed(feedItem.origin),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    content: toStorageVideoFeedItemContent(feedItem.content),
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

function toStorageWebsiteFeedItem(feedItem: WebsiteFeedItem): WebsiteFeedItemFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Website,
    feedItemId: feedItem.feedItemId,
    origin: toStorageFeed(feedItem.origin),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    content: toStorageWebsiteFeedItemContent(feedItem.content),
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

function toStorageTweetFeedItem(feedItem: TweetFeedItem): TweetFeedItemFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Tweet,
    feedItemId: feedItem.feedItemId,
    origin: toStorageFeed(feedItem.origin),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    content: toStorageTweetFeedItemContent(feedItem.content),
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

function toStorageYouTubeFeedItem(feedItem: YouTubeFeedItem): YouTubeFeedItemFromStorage {
  return {
    feedItemContentType: FeedItemContentType.YouTube,
    feedItemId: feedItem.feedItemId,
    origin: toStorageFeed(feedItem.origin),
    accountId: feedItem.accountId,
    importState: feedItem.importState,
    content: toStorageYouTubeFeedItemContent(feedItem.content),
    triageStatus: feedItem.triageStatus,
    tagIds: feedItem.tagIds,
    createdTime: feedItem.createdTime,
    lastUpdatedTime: feedItem.lastUpdatedTime,
  };
}

function toStorageXkcdFeedItem(feedItem: XkcdFeedItem): XkcdFeedItemFromStorage {
  return {
    feedItemContentType: FeedItemContentType.Xkcd,
    feedItemId: feedItem.feedItemId,
    origin: toStorageFeed(feedItem.origin),
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
    feedItemContentType: FeedItemContentType.Interval,
    feedItemId: feedItem.feedItemId,
    origin: toStorageFeed(feedItem.origin),
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
 * Converts a {@link FeedItemFromStorage} into a {@link FeedItem}.
 */
export function fromStorageFeedItem(
  feedItemFromStorage: FeedItemFromStorage
): Result<FeedItem, Error> {
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

function fromStorageFeedItemShared(feedItemFromStorage: FeedItemFromStorage): Result<
  {
    readonly feedItemId: FeedItemId;
    readonly accountId: AccountId;
    readonly importState: FeedItemImportState;
    readonly origin: Feed;
    readonly feedItemContentType: FeedItemContentType;
    readonly triageStatus: TriageStatus;
  },
  Error
> {
  const parsedFeedItemIdResult = parseFeedItemId(feedItemFromStorage.feedItemId);
  if (!parsedFeedItemIdResult.success) return parsedFeedItemIdResult;

  const parsedAccountIdResult = parseAccountId(feedItemFromStorage.accountId);
  if (!parsedAccountIdResult.success) return parsedAccountIdResult;

  const parsedImportStateResult = fromStorageFeedItemImportState(feedItemFromStorage.importState);
  if (!parsedImportStateResult.success) return parsedImportStateResult;

  const parsedOriginResult = parseFeed(feedItemFromStorage.origin);
  if (!parsedOriginResult.success) return parsedOriginResult;

  return makeSuccessResult({
    feedItemId: parsedFeedItemIdResult.value,
    accountId: parsedAccountIdResult.value,
    importState: parsedImportStateResult.value,
    origin: parsedOriginResult.value,
    feedItemContentType: feedItemFromStorage.feedItemContentType,
    triageStatus: feedItemFromStorage.triageStatus,
  });
}

function fromStorageArticleFeedItem(
  feedItemFromStorage: ArticleFeedItemFromStorage
): Result<ArticleFeedItem, Error> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, origin} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageArticleFeedItemContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: feedItemFromStorage.feedItemContentType,
    feedItemId,
    origin,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: parseStorageTimestamp(feedItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedItemFromStorage.lastUpdatedTime),
  });
}

function fromStorageVideoFeedItem(
  feedItemFromStorage: VideoFeedItemFromStorage
): Result<VideoFeedItem, Error> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, origin} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageVideoFeedItemContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: feedItemFromStorage.feedItemContentType,
    feedItemId,
    origin,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: parseStorageTimestamp(feedItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedItemFromStorage.lastUpdatedTime),
  });
}

function fromStorageWebsiteFeedItem(
  feedItemFromStorage: WebsiteFeedItemFromStorage
): Result<WebsiteFeedItem, Error> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, origin} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageWebsiteFeedItemContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: feedItemFromStorage.feedItemContentType,
    feedItemId,
    origin,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: parseStorageTimestamp(feedItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedItemFromStorage.lastUpdatedTime),
  });
}

function fromStorageTweetFeedItem(
  feedItemFromStorage: TweetFeedItemFromStorage
): Result<TweetFeedItem, Error> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, origin} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageTweetFeedItemContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: feedItemFromStorage.feedItemContentType,
    feedItemId,
    origin,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: parseStorageTimestamp(feedItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedItemFromStorage.lastUpdatedTime),
  });
}

function fromStorageYouTubeFeedItem(
  feedItemFromStorage: YouTubeFeedItemFromStorage
): Result<YouTubeFeedItem, Error> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, origin} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageYouTubeFeedItemContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: feedItemFromStorage.feedItemContentType,
    feedItemId,
    origin,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: parseStorageTimestamp(feedItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedItemFromStorage.lastUpdatedTime),
  });
}

function fromStorageXkcdFeedItem(
  feedItemFromStorage: XkcdFeedItemFromStorage
): Result<XkcdFeedItem, Error> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, origin} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageXkcdFeedItemContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Xkcd,
    feedItemId,
    origin,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: parseStorageTimestamp(feedItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedItemFromStorage.lastUpdatedTime),
  });
}

function fromStorageIntervalFeedItem(
  feedItemFromStorage: IntervalFeedItemFromStorage
): Result<IntervalFeedItem, Error> {
  const parsedFeedItemSharedResult = fromStorageFeedItemShared(feedItemFromStorage);
  if (!parsedFeedItemSharedResult.success) return parsedFeedItemSharedResult;
  const {feedItemId, accountId, importState, origin} = parsedFeedItemSharedResult.value;

  const parsedContentResult = fromStorageIntervalFeedItemContent(feedItemFromStorage.content);
  if (!parsedContentResult.success) return parsedContentResult;

  return makeSuccessResult({
    feedItemContentType: FeedItemContentType.Interval,
    feedItemId,
    origin,
    accountId,
    importState,
    content: parsedContentResult.value,
    triageStatus: feedItemFromStorage.triageStatus,
    tagIds: feedItemFromStorage.tagIds,
    createdTime: parseStorageTimestamp(feedItemFromStorage.createdTime),
    lastUpdatedTime: parseStorageTimestamp(feedItemFromStorage.lastUpdatedTime),
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
): Result<FeedItemImportState, Error> {
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
