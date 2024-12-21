import {FieldValue} from 'firebase/firestore';

import {makeId} from '@shared/lib/utils';

import {IconName} from '@shared/types/icons.types';
import {makeErrorResult, makeSuccessResult, Result} from '@shared/types/result.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {TagId} from '@shared/types/tags.types';
import {UserId} from '@shared/types/user.types';
import {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import {BaseStoreItem, Timestamp} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a feed item's unique identifier. Prefer this over plain strings.
 */
export type FeedItemId = string & {readonly __brand: 'FeedItemIdBrand'};

/**
 * Checks if a value is a valid `FeedItemId`.
 */
export function isFeedItemId(maybeFeedItemId: unknown): maybeFeedItemId is FeedItemId {
  return typeof maybeFeedItemId === 'string' && maybeFeedItemId.length > 0;
}

/**
 * Converts a plain string into a strongly-typed `FeedItemId`. Returns an error if the string is
 * not a valid `FeedItemId`.
 */
export function makeFeedItemId(maybeFeedItemId: string = makeId()): Result<FeedItemId> {
  if (!isFeedItemId(maybeFeedItemId)) {
    return makeErrorResult(new Error(`Invalid feed item ID: "${maybeFeedItemId}"`));
  }
  return makeSuccessResult(maybeFeedItemId);
}

// TODO: Do I want to persist this or just compute it on the client?
export enum FeedItemType {
  Article = 'ARTICLE',
  Video = 'VIDEO',
  Website = 'WEBSITE',
  Tweet = 'TWEET',
  Xkcd = 'XKCD',
}

export enum TriageStatus {
  Untriaged = 'UNTRIAGED',
  Saved = 'SAVED',
  Done = 'DONE',
  Trashed = 'TRASHED',
}

export enum FeedItemSourceType {
  /** Feed item was manually added from the app. */
  App = 'APP',
  /** Feed item was manually added from the web extension. */
  Extension = 'EXTENSION',
  /** Feed item was added from an RSS feed subscription. */
  RSS = 'RSS',
}

interface FeedItemAppSource {
  readonly type: FeedItemSourceType.App;
}

export const FEED_ITEM_EXTENSION_SOURCE: FeedItemExtensionSource = {
  type: FeedItemSourceType.Extension,
};

interface FeedItemExtensionSource {
  readonly type: FeedItemSourceType.Extension;
}

export const FEED_ITEM_APP_SOURCE: FeedItemAppSource = {
  type: FeedItemSourceType.App,
};

interface FeedItemRSSSource {
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
