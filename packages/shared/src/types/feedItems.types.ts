import {z} from 'zod';

import {makeUuid} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {AccountIdSchema} from '@shared/types/accounts.types';
import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {IconName} from '@shared/types/icons.types';
import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import type {TagId} from '@shared/types/tags.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import {UserFeedSubscriptionIdSchema} from '@shared/types/userFeedSubscriptions.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

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
  return makeUuid<FeedItemId>();
}

export enum FeedItemType {
  Article = 'ARTICLE',
  Video = 'VIDEO',
  Website = 'WEBSITE',
  Tweet = 'TWEET',
  Xkcd = 'XKCD',
  YouTube = 'YOUTUBE',
}

export enum FeedItemSourceType {
  /** Feed item was manually added from the app. */
  App = 'APP',
  /** Feed item was manually added from the web extension. */
  Extension = 'EXTENSION',
  /** Feed item was added from an RSS feed subscription. */
  RSS = 'RSS',
  /** Feed item was imported from a Pocket export. */
  PocketExport = 'POCKET_EXPORT',
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

export const PocketExportFeedItemSourceSchema = z.object({
  type: z.literal(FeedItemSourceType.PocketExport),
});

export const FeedItemSourceFromStorageSchema = z.discriminatedUnion('type', [
  AppFeedItemSourceSchema,
  ExtensionFeedItemSourceSchema,
  RssFeedItemSourceSchema,
  PocketExportFeedItemSourceSchema,
]);

export type FeedItemSourceFromStorage = z.infer<typeof FeedItemSourceFromStorageSchema>;

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

export interface FeedItemPocketExportSource extends BaseFeedItemSource {
  readonly type: FeedItemSourceType.PocketExport;
}

export const FEED_ITEM_POCKET_EXPORT_SOURCE: FeedItemPocketExportSource = {
  type: FeedItemSourceType.PocketExport,
};

export type FeedItemSource =
  | FeedItemAppSource
  | FeedItemExtensionSource
  | FeedItemRSSSource
  | FeedItemPocketExportSource;

export enum FeedItemImportStatus {
  /** Created but not yet processed. */
  New = 'NEW',
  /** Currently being processed. */
  Processing = 'PROCESSING',
  /** Errored while processing. May have partially imported data. */
  Failed = 'FAILED',
  /** Successfully imported all data. */
  Completed = 'COMPLETED',
}

interface BaseFeedItemImportState {
  readonly status: FeedItemImportStatus;
  readonly shouldFetch: boolean;
  readonly lastImportRequestedTime: Date;
  readonly lastSuccessfulImportTime: Date | null;
}

export interface NewFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.New;
  readonly shouldFetch: true;
  readonly lastSuccessfulImportTime: null;
}

export function makeNewFeedItemImportState(): NewFeedItemImportState {
  return {
    status: FeedItemImportStatus.New,
    shouldFetch: true,
    lastImportRequestedTime: new Date(),
    lastSuccessfulImportTime: null,
  };
}

export interface ProcessingFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.Processing;
  readonly shouldFetch: false;
  readonly importStartedTime: Date;
  readonly lastSuccessfulImportTime: Date | null;
}

export interface FailedFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.Failed;
  readonly shouldFetch: boolean;
  readonly errorMessage: string;
  readonly importFailedTime: Date;
  readonly lastSuccessfulImportTime: Date | null;
}

export interface CompletedFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.Completed;
  readonly shouldFetch: boolean;
  readonly lastSuccessfulImportTime: Date;
}

export type FeedItemImportState =
  | NewFeedItemImportState
  | ProcessingFeedItemImportState
  | FailedFeedItemImportState
  | CompletedFeedItemImportState;

interface BaseFeedItem extends BaseStoreItem {
  readonly feedItemId: FeedItemId;
  readonly type: FeedItemType;
  /** ID of the account that owns the feed item. */
  readonly accountId: AccountId;
  /** Source of the feed item. */
  readonly feedItemSource: FeedItemSource;
  /** State of the feed item's import process. */
  readonly importState: FeedItemImportState;
  /** URL of the content. */
  readonly url: string;
  /** Title of the content provided by the source. */
  readonly title: string;
  /** Description of the content provided by the source. */
  readonly description: string | null;
  /** Summary of the content generated by AI. */
  readonly summary: string | null;
  /** Links found in the source content. */
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
   * - indexing of arbitrary boolean states.
   *
   * To accomplish this, most state is stored as tags that either exist in this map or not.
   */
  readonly tagIds: Partial<Record<TagId, true>>;
}

export const NewFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.New),
  shouldFetch: z.literal(true),
  lastSuccessfulImportTime: z.null(),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

export const ProcessingFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Processing),
  shouldFetch: z.literal(false),
  importStartedTime: FirestoreTimestampSchema.or(z.date()),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

export const FailedFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Failed),
  shouldFetch: z.boolean(),
  errorMessage: z.string(),
  importFailedTime: FirestoreTimestampSchema.or(z.date()),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

export const CompletedFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Completed),
  shouldFetch: z.boolean(),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

const FeedItemImportStateFromStorageSchema = z.discriminatedUnion('status', [
  NewFeedItemImportStateSchema,
  ProcessingFeedItemImportStateSchema,
  FailedFeedItemImportStateSchema,
  CompletedFeedItemImportStateSchema,
]);

export type FeedItemImportStateFromStorage = z.infer<typeof FeedItemImportStateFromStorageSchema>;

/**
 * Zod schema for a {@link FeedItem} persisted to Firestore.
 */
export const BaseFeedItemFromStorageSchema = z.object({
  type: z.nativeEnum(FeedItemType),
  feedItemId: FeedItemIdSchema,
  accountId: AccountIdSchema,
  feedItemSource: FeedItemSourceFromStorageSchema,
  importState: FeedItemImportStateFromStorageSchema,
  triageStatus: z.nativeEnum(TriageStatus),
  url: z.string().url(),
  title: z.string(),
  description: z.string().nullable(),
  summary: z.string().nullable(),
  outgoingLinks: z.array(z.string().url()),
  tagIds: z.record(z.string(), z.literal(true).optional()),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

/**
 * Type for a {@link FeedItem} persisted to Firestore.
 */
export type BaseFeedItemFromStorage = z.infer<typeof BaseFeedItemFromStorageSchema>;

/**
 * Zod schema for an {@link XkcdFeedItem} persisted to Firestore.
 */
export const XkcdFeedItemFromStorageSchema = BaseFeedItemFromStorageSchema.extend({
  type: z.literal(FeedItemType.Xkcd),
  xkcd: z
    .object({
      imageUrl: z.string().url(),
      altText: z.string(),
    })
    .nullable(),
});

/**
 * Type for an {@link XkcdFeedItem} persisted to Firestore.
 */
export type XkcdFeedItemFromStorage = z.infer<typeof XkcdFeedItemFromStorageSchema>;

export type FeedItemFromStorage = BaseFeedItemFromStorage | XkcdFeedItemFromStorage;

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
  readonly xkcd: {
    readonly imageUrl: string;
    readonly altText: string;
  } | null;
}

export interface YouTubeFeedItem extends BaseFeedItem {
  readonly type: FeedItemType.YouTube;
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
  | XkcdFeedItem
  | YouTubeFeedItem;

export enum FeedItemActionType {
  Cancel = 'CANCEL',
  DebugSaveExample = 'DEBUG_SAVE_EXAMPLE',
  MarkDone = 'MARK_DONE',
  MarkUnread = 'MARK_UNREAD',
  Save = 'SAVE',
  Star = 'STAR',
  RetryImport = 'RETRY_IMPORT',
}

export interface FeedItemAction {
  readonly type: FeedItemActionType;
  // TODO: Should this have `feedId` on it? Should it be optional?
  readonly text: string;
  readonly icon: IconName;
  readonly shortcutId?: KeyboardShortcutId;
}
