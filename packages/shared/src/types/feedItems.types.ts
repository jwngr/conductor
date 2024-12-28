import type {FieldValue} from 'firebase/firestore';
import {z} from 'zod';

import {
  parseZodResult,
  prefixErrorResult,
  prefixResultIfError,
} from '@shared/lib/errorUtils.shared';
import {assertNever, makeId} from '@shared/lib/utils.shared';

import type {IconName} from '@shared/types/icons.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import type {TagId} from '@shared/types/tags.types';
import {parseUserId, UserIdSchema, type UserId} from '@shared/types/user.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import {
  parseUserFeedSubscriptionId,
  UserFeedSubscriptionIdSchema,
} from '@shared/types/userFeedSubscriptions.types';
import type {BaseStoreItem, Timestamp} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a {@link FeedItem}'s unique identifier. Prefer this over plain strings.
 */
export type FeedItemId = string & {readonly __brand: 'FeedItemIdBrand'};

export const FeedItemIdSchema = z.string().uuid();

// TODO: Do I want to persist this or just compute it on the client?
export enum FeedItemType {
  Article = 'ARTICLE',
  Video = 'VIDEO',
  Website = 'WEBSITE',
  Tweet = 'TWEET',
  Xkcd = 'XKCD',
}

export enum FeedItemSourceType {
  /** Feed item was manually added from the app. */
  App = 'APP',
  /** Feed item was manually added from the web extension. */
  Extension = 'EXTENSION',
  /** Feed item was added from an RSS feed subscription. */
  RSS = 'RSS',
}

export enum TriageStatus {
  Untriaged = 'UNTRIAGED',
  Saved = 'SAVED',
  Done = 'DONE',
  Trashed = 'TRASHED',
}

const AppFeedItemSourceSchema = z.object({
  type: z.literal(FeedItemSourceType.App),
});

const ExtensionFeedItemSourceSchema = z.object({
  type: z.literal(FeedItemSourceType.Extension),
});

const RssFeedItemSourceSchema = z.object({
  type: z.literal(FeedItemSourceType.RSS),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

export const FeedItemSourceSchema = z.union([
  AppFeedItemSourceSchema,
  ExtensionFeedItemSourceSchema,
  RssFeedItemSourceSchema,
]);

export const FeedItemSchema = z.object({
  feedItemId: FeedItemIdSchema,
  userId: UserIdSchema,
  type: z.nativeEnum(FeedItemType),
  source: FeedItemSourceSchema,
  url: z.string(),
  title: z.string(),
  description: z.string(),
  outgoingLinks: z.array(z.string()),
  triageStatus: z.nativeEnum(TriageStatus),
  tagIds: z.record(z.string(), z.boolean()),
  lastImportedTime: z.string().datetime(),
  createdTime: z.string().datetime(),
  lastUpdatedTime: z.string().datetime(),
});

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
 * Creates a new random {@link FeedItemId}.
 */
export function makeFeedItemId(): FeedItemId {
  return makeId() as FeedItemId;
}

/**
 * Parses a {@link FeedItemSource} from an unknown value. Returns an `ErrorResult` if the value is
 * not valid.
 */
export function parseFeedItemSource(
  source: unknown,
  sourceType: FeedItemSourceType
): Result<FeedItemSource> {
  switch (sourceType) {
    case FeedItemSourceType.App:
      return parseAppFeedItemSource(source);
    case FeedItemSourceType.Extension:
      return parseExtensionFeedItemSource(source);
    case FeedItemSourceType.RSS:
      return parseRssFeedItemSource(source);
    default:
      assertNever(sourceType);
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

  const {url, title, createdTime, lastUpdatedTime} = parsedFeedItemResult.value;

  return makeSuccessResult({
    type: parsedFeedItemResult.value.type,
    userId: parsedUserIdResult.value,
    source: parsedSourceResult.value,
    feedItemId: parsedIdResult.value,
    url,
    title,
    description: '',
    outgoingLinks: [],
    triageStatus: parsedFeedItemResult.value.triageStatus,
    tagIds: {},
    lastImportedTime: new Date(parsedFeedItemResult.value.lastImportedTime) as unknown as Timestamp,
    createdTime: new Date(createdTime) as unknown as Timestamp,
    lastUpdatedTime: new Date(lastUpdatedTime) as unknown as Timestamp,
  });
}

interface BaseFeedItemSource {
  // TODO: Consider renaming this to `sourceType`.
  readonly type: FeedItemSourceType;
}

interface FeedItemAppSource extends BaseFeedItemSource {
  readonly type: FeedItemSourceType.App;
}

export const FEED_ITEM_EXTENSION_SOURCE: FeedItemExtensionSource = {
  type: FeedItemSourceType.Extension,
};

interface FeedItemExtensionSource extends BaseFeedItemSource {
  readonly type: FeedItemSourceType.Extension;
}

export const FEED_ITEM_APP_SOURCE: FeedItemAppSource = {
  type: FeedItemSourceType.App,
};

interface FeedItemRSSSource extends BaseFeedItemSource {
  readonly type: FeedItemSourceType.RSS;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export function makeFeedItemRSSSource(
  userFeedSubscriptionId: UserFeedSubscriptionId
): FeedItemRSSSource {
  return {
    type: FeedItemSourceType.RSS,
    userFeedSubscriptionId: userFeedSubscriptionId,
  };
}

export type FeedItemSource =
  | typeof FEED_ITEM_APP_SOURCE
  | typeof FEED_ITEM_EXTENSION_SOURCE
  | FeedItemRSSSource;

interface BaseFeedItem extends BaseStoreItem {
  readonly feedItemId: FeedItemId;
  readonly userId: UserId;
  readonly type: FeedItemType;
  readonly source: FeedItemSource;

  // Content metadata.
  readonly url: string;
  readonly title: string;
  readonly description: string;
  /** Links found in the scraped URL content. */
  readonly outgoingLinks: string[];

  /**
   * Triage status determines where the feed item "lives" in the app.
   *
   * Unlike tags which represent boolean states, these statuses form an exclusive set.
   */
  readonly triageStatus: TriageStatus;

  /**
   * Feed item state needs to allow for:
   * - quick reads and writes.
   * - indexing of arbitrary boolean user states.
   *
   * To accomplish this, most state is stored as tags that either exist in this map or not.
   *
   * Note: FieldValue is used to delete tags.
   * TODO: Consider abstracting this strange type way with a Firestore converter.
   * See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
   */
  readonly tagIds: Partial<Record<TagId, true | FieldValue>>;

  // Timestamps.
  readonly lastImportedTime?: Timestamp;
}

export interface ArticleFeedItem extends BaseFeedItem {
  readonly type: FeedItemType.Article;
}

export interface VideoFeedItem extends BaseFeedItem {
  readonly type: FeedItemType.Video;
}

export interface WebsiteFeedItem extends BaseFeedItem {
  readonly type: FeedItemType.Website;
}

export interface TweetFeedItem extends BaseFeedItem {
  readonly type: FeedItemType.Tweet;
}

export interface XkcdFeedItem extends BaseFeedItem {
  readonly type: FeedItemType.Xkcd;
}

/**
 * The basic unit of content in the app. Generated by {@link Feed}s and come in many different
 * types.
 */
export type FeedItem =
  | ArticleFeedItem
  | VideoFeedItem
  | WebsiteFeedItem
  | TweetFeedItem
  | XkcdFeedItem;

export enum FeedItemActionType {
  MarkDone = 'MARK_DONE',
  MarkUnread = 'MARK_UNREAD',
  Save = 'SAVE',
  Star = 'STAR',
}

export interface FeedItemAction {
  readonly type: FeedItemActionType;
  // TODO: Should this have `feedId` on it? Should it be optional?
  readonly text: string;
  readonly icon: IconName;
  readonly shortcutId: KeyboardShortcutId;
}
