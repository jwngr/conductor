import {RSSItemType} from './rss';
import {TagId} from './tags';

export type SavedItemId = string;

enum SavedItemContentType {
  Video = 'VIDEO',
  Article = 'ARTICLE',
  Image = 'IMAGE',
}

// enum SavedItemType {
//   RSS = 'RSS',
//   Twitter = 'TWITTER',
//   YouTube = 'YOUTUBE',
// }

export interface BaseSavedItem {
  readonly itemId: SavedItemId;
  // readonly type: SavedItemType;
  readonly contentType: SavedItemContentType;
  /** The URL actually saved by the user */
  readonly savedUrl: string;
  /**
   * The fully resolved URL of the item.  For example a direct link to a New York Times article and a link
   * that redirects (ex a shortened bit.ly url) to the same article will share the same resolved URL.
   * If this value is empty, the resolved URL has not been processed yet. Normally this happens
   * within seconds.
   */
  readonly canonicalUrl?: string;
  /** The title that saved along with the item. */
  readonly savedTitle: string;
  /** The title found for the item when it was parsed. */
  readonly resolvedTitle: string;
  /** An AI-generated short summary of the item. May be empty if the summary has not been generated yet. */
  readonly shortSummary?: string;
  /** A snippet of the beginning of the item. */
  readonly snippet?: string;
  /** Tags associated with the item. */
  readonly tags: TagId[];
  /** The date the item was saved by this user. */
  readonly savedAt: number;
  /** The date the original source was published by the publisher. */
  readonly publishedAt: number;
  /** The date the original source was updated by the publisher. */
  readonly updatedAt: number;
  /** The date the item was archived. The source of truth is the ARCHIVED tag. */
  readonly archivedAt?: number;
  /** The date the item was first recrawled and parsed. */
  readonly firstCrawledAt?: number;
  /** The date the item was last recrawled and parsed. */
  readonly lastCrawledAt?: number;
  /** The date the item was read by the user. */
  readonly readAt?: number;
  /** The number of words in the item. */
  readonly wordCount?: number;
  readonly language: string;
  readonly authors: readonly string[];
  readonly images: readonly string[];
  readonly videos: readonly string[];
  // TODO: Content
  // content?
}

export interface RSSSavedItem extends BaseSavedItem {
  readonly rssItemType: RSSItemType;
  readonly imageUrl?: string;
}

export interface TwitterSavedItem extends BaseSavedItem {
  readonly tweetId: string;
  readonly tweetUrl: string;
  readonly author: string;
}

export interface YouTubeSavedItem extends BaseSavedItem {
  readonly videoId: string;
  readonly videoUrl: string;
}

export type SavedItem = RSSSavedItem | TwitterSavedItem | YouTubeSavedItem;

// export type SavedItem = RSSSavedItem | TwitterSavedItem | YouTubeSavedItem;

export interface SavedItemGroup {
  readonly groupId: string;
  readonly name: string;
  readonly emoji: string;
  //   readonly description: string;
  readonly itemIds: readonly SavedItemId[];
  readonly tagIds: readonly TagId[];
}
