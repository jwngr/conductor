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
  /** Re-import is needed for some reason. */
  NeedsRefresh = 'NEEDS_REFRESH',
}

interface BaseFeedItemImportState {
  readonly status: FeedItemImportStatus;
  readonly lastSuccessfulImportTime: Date | null;
}

export interface NewFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.New;
  readonly lastSuccessfulImportTime: null;
}

export const NEW_FEED_ITEM_IMPORT_STATE: NewFeedItemImportState = {
  status: FeedItemImportStatus.New,
  lastSuccessfulImportTime: null,
};

export interface ProcessingFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.Processing;
  readonly importStartedTime: Date;
  readonly lastSuccessfulImportTime: Date | null;
}

export interface FailedFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.Failed;
  readonly errorMessage: string;
  readonly importFailedTime: Date;
  readonly lastSuccessfulImportTime: Date | null;
}

export interface CompletedFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.Completed;
  readonly lastSuccessfulImportTime: Date;
}

export interface NeedsRefreshFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.NeedsRefresh;
  readonly refreshRequestedTime: Date;
  readonly lastSuccessfulImportTime: Date | null;
}

export type FeedItemImportState =
  | NewFeedItemImportState
  | ProcessingFeedItemImportState
  | FailedFeedItemImportState
  | CompletedFeedItemImportState
  | NeedsRefreshFeedItemImportState;

interface BaseFeedItem extends BaseStoreItem {
  readonly feedItemId: FeedItemId;
  readonly accountId: AccountId;
  readonly type: FeedItemType;
  readonly feedItemSource: FeedItemSource;
  readonly importState: FeedItemImportState;

  // Content metadata.
  readonly url: string;
  readonly title: string;
  readonly description: string;
  /** Links found in the scraped URL content. */
  readonly outgoingLinks: string[];
  /** AI-generated hierarchical summary of the content. */
  readonly summary: string;

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
  lastSuccessfulImportTime: z.null(),
});

export const ProcessingFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Processing),
  importStartedTime: FirestoreTimestampSchema.or(z.date()),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
});

export const FailedFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Failed),
  errorMessage: z.string(),
  importFailedTime: FirestoreTimestampSchema.or(z.date()),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
});

export const CompletedFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Completed),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()),
});

export const NeedsRefreshFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.NeedsRefresh),
  refreshRequestedTime: FirestoreTimestampSchema.or(z.date()),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
});

const FeedItemImportStateFromStorageSchema = z.discriminatedUnion('status', [
  NewFeedItemImportStateSchema,
  ProcessingFeedItemImportStateSchema,
  FailedFeedItemImportStateSchema,
  CompletedFeedItemImportStateSchema,
  NeedsRefreshFeedItemImportStateSchema,
]);

export type FeedItemImportStateFromStorage = z.infer<typeof FeedItemImportStateFromStorageSchema>;

/**
 * Zod schema for a {@link FeedItem} persisted to Firestore.
 */
export const FeedItemFromStorageSchema = z.object({
  feedItemId: FeedItemIdSchema,
  accountId: AccountIdSchema,
  type: z.nativeEnum(FeedItemType),
  feedItemSource: FeedItemSourceFromStorageSchema,
  importState: FeedItemImportStateFromStorageSchema,
  url: z.string().url(),
  title: z.string(),
  description: z.string(),
  outgoingLinks: z.array(z.string().url()),
  summary: z.string(),
  triageStatus: z.nativeEnum(TriageStatus),
  tagIds: z.record(z.string(), z.literal(true).optional()),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

/**
 * Type for a {@link FeedItem} persisted to Firestore.
 */
export type FeedItemFromStorage = z.infer<typeof FeedItemFromStorageSchema>;

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
