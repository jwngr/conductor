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
import {YouTubeChannelIdSchema} from '@shared/types/youtube.types';
import type {YouTubeChannelId} from '@shared/types/youtube.types';

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

/**
 * The origin of the feed item. Where the feed item came from.
 */
export enum FeedSourceType {
  /** RSS feeds. */
  RSS = 'RSS',
  /** YouTube channels. */
  YouTubeChannel = 'YOUTUBE_CHANNEL',
  /** Dummy feeds that automatically generate items at a fixed interval. */
  Interval = 'INTERVAL',
  /** Feeds that are added from the PWA. */
  PWA = 'PWA',
  /** Feeds that are added from the web extension. */
  Extension = 'EXTENSION',
  /** Feeds that are added from a Pocket export. */
  PocketExport = 'POCKET_EXPORT',
}

interface BaseFeedSource {
  readonly feedSourceType: FeedSourceType;
}

export interface RssFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.RSS;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly url: string;
  readonly title: string;
}

export interface YouTubeChannelFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.YouTubeChannel;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly channelId: YouTubeChannelId;
}

export interface IntervalFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.Interval;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export interface PwaFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.PWA;
}

export const PWA_FEED_SOURCE: PwaFeedSource = {
  feedSourceType: FeedSourceType.PWA,
};

export interface ExtensionFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.Extension;
}

export const EXTENSION_FEED_SOURCE: ExtensionFeedSource = {
  feedSourceType: FeedSourceType.Extension,
};

export interface PocketExportFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.PocketExport;
}

export const POCKET_EXPORT_FEED_SOURCE: PocketExportFeedSource = {
  feedSourceType: FeedSourceType.PocketExport,
};

export type FeedSource =
  | RssFeedSource
  | YouTubeChannelFeedSource
  | IntervalFeedSource
  | PwaFeedSource
  | ExtensionFeedSource
  | PocketExportFeedSource;

export enum TriageStatus {
  Untriaged = 'UNTRIAGED',
  Saved = 'SAVED',
  Done = 'DONE',
  Trashed = 'TRASHED',
}

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
  readonly feedItemType: FeedItemType;
  /** TODO: Better name + comment: Source of the feed item. */
  readonly feedSource: FeedSource;
  /** ID of the account that owns the feed item. */
  readonly accountId: AccountId;
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

const BaseFeedSourceSchema = z.object({
  feedSourceType: z.nativeEnum(FeedSourceType),
});

export const RssFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedSourceType: z.literal(FeedSourceType.RSS),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  url: z.string().url(),
  title: z.string(),
});

export const YouTubeChannelFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedSourceType: z.literal(FeedSourceType.YouTubeChannel),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  channelId: YouTubeChannelIdSchema,
});

export const IntervalFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedSourceType: z.literal(FeedSourceType.Interval),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

const PwaFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedSourceType: z.literal(FeedSourceType.PWA),
});

const ExtensionFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedSourceType: z.literal(FeedSourceType.Extension),
});

const PocketExportFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedSourceType: z.literal(FeedSourceType.PocketExport),
});

export const FeedSourceSchema = z.discriminatedUnion('feedSourceType', [
  RssFeedSourceSchema,
  YouTubeChannelFeedSourceSchema,
  IntervalFeedSourceSchema,
  PwaFeedSourceSchema,
  ExtensionFeedSourceSchema,
  PocketExportFeedSourceSchema,
]);

/**
 * Zod schema for a {@link FeedItem} persisted to Firestore.
 */
export const BaseFeedItemFromStorageSchema = z.object({
  feedItemType: z.nativeEnum(FeedItemType),
  feedSource: FeedSourceSchema,
  feedItemId: FeedItemIdSchema,
  accountId: AccountIdSchema,
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
  feedItemType: z.literal(FeedItemType.Xkcd),
  xkcd: z
    .object({
      altText: z.string(),
      imageUrlSmall: z.string().url(),
      imageUrlLarge: z.string().url(),
    })
    .nullable(),
});

/**
 * Type for an {@link XkcdFeedItem} persisted to Firestore.
 */
export type XkcdFeedItemFromStorage = z.infer<typeof XkcdFeedItemFromStorageSchema>;

export type FeedItemFromStorage = BaseFeedItemFromStorage | XkcdFeedItemFromStorage;

export interface ArticleFeedItem extends BaseFeedItem {
  readonly feedItemType: FeedItemType.Article;
}

export interface VideoFeedItem extends BaseFeedItem {
  readonly feedItemType: FeedItemType.Video;
}

export interface WebsiteFeedItem extends BaseFeedItem {
  readonly feedItemType: FeedItemType.Website;
}

export interface TweetFeedItem extends BaseFeedItem {
  readonly feedItemType: FeedItemType.Tweet;
}

export interface XkcdFeedItem extends BaseFeedItem {
  readonly feedItemType: FeedItemType.Xkcd;
  readonly xkcd: {
    readonly altText: string;
    readonly imageUrlSmall: string;
    readonly imageUrlLarge: string;
  } | null;
}

export interface YouTubeFeedItem extends BaseFeedItem {
  readonly feedItemType: FeedItemType.YouTube;
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
  MarkDone = 'MARK_DONE',
  MarkUnread = 'MARK_UNREAD',
  Save = 'SAVE',
  Star = 'STAR',
  RetryImport = 'RETRY_IMPORT',
  Undo = 'UNDO',
}

export interface FeedItemAction {
  readonly actionType: FeedItemActionType;
  // TODO: Should this have `feedId` on it? Should it be optional?
  readonly text: string;
  readonly icon: IconName;
  readonly shortcutId?: KeyboardShortcutId;
}
