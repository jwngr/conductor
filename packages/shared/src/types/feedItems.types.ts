import type {FieldValue} from 'firebase/firestore';
import {z} from 'zod';

import {makeId} from '@shared/lib/utils.shared';

import type {IconName} from '@shared/types/icons.types';
import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import type {TagId} from '@shared/types/tags.types';
import {UserIdSchema, type UserId} from '@shared/types/user.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import {UserFeedSubscriptionIdSchema} from '@shared/types/userFeedSubscriptions.types';
import type {BaseStoreItem, Timestamp} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a {@link FeedItem}'s unique identifier. Prefer this over plain strings.
 */
export type FeedItemId = string & {readonly __brand: 'FeedItemIdBrand'};

/**
 * Zod schema for a {@link FeedItemId}.
 */
export const FeedItemIdSchema = z.string().uuid();

/**
 * Creates a new random {@link FeedItemId}.
 */
export function makeFeedItemId(): FeedItemId {
  return makeId() as FeedItemId;
}

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

export const AppFeedItemSourceSchema = z.object({
  type: z.literal(FeedItemSourceType.App),
});

export const ExtensionFeedItemSourceSchema = z.object({
  type: z.literal(FeedItemSourceType.Extension),
});

export const RssFeedItemSourceSchema = z.object({
  type: z.literal(FeedItemSourceType.RSS),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

export const FeedItemSourceSchema = z.discriminatedUnion('type', [
  AppFeedItemSourceSchema,
  ExtensionFeedItemSourceSchema,
  RssFeedItemSourceSchema,
]);

/**
 * Zod schema for a {@link FeedItem}. This should be kept in sync with that interface.
 */
export const FeedItemSchema = z.object({
  feedItemId: FeedItemIdSchema,
  userId: UserIdSchema,
  type: z.nativeEnum(FeedItemType),
  source: FeedItemSourceSchema,
  url: z.string(),
  // title: z.string(),
  description: z.string(),
  outgoingLinks: z.array(z.string()),
  triageStatus: z.nativeEnum(TriageStatus),
  tagIds: z.record(z.string(), z.boolean()),
  lastImportedTime: z.string().datetime(),
  createdTime: z.string().datetime(),
  lastUpdatedTime: z.string().datetime(),
});
interface BaseFeedItemSource {
  // TODO: Consider renaming this to `sourceType`.
  readonly type: FeedItemSourceType;
}

export interface FeedItemAppSource extends BaseFeedItemSource {
  readonly type: FeedItemSourceType.App;
}

export const FEED_ITEM_EXTENSION_SOURCE: FeedItemExtensionSource = {
  type: FeedItemSourceType.Extension,
};

export interface FeedItemExtensionSource extends BaseFeedItemSource {
  readonly type: FeedItemSourceType.Extension;
}

export const FEED_ITEM_APP_SOURCE: FeedItemAppSource = {
  type: FeedItemSourceType.App,
};

export interface FeedItemRSSSource extends BaseFeedItemSource {
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

export type FeedItemSource = FeedItemAppSource | FeedItemExtensionSource | FeedItemRSSSource;

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
