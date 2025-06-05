import {z} from 'zod';

import {
  FeedItemContentType,
  FeedItemImportStatus,
  TriageStatus,
} from '@shared/types/feedItems.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {FeedSourceSchema} from '@shared/schemas/feedSources.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';

export const FeedItemIdSchema = z.string().uuid();

//////////////////////////////
//  FEED ITEM IMPORT STATE  //
//////////////////////////////
const NewFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.New),
  shouldFetch: z.literal(true),
  lastSuccessfulImportTime: z.null(),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

const ProcessingFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Processing),
  shouldFetch: z.literal(false),
  importStartedTime: FirestoreTimestampSchema.or(z.date()),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

const FailedFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Failed),
  shouldFetch: z.boolean(),
  errorMessage: z.string(),
  importFailedTime: FirestoreTimestampSchema.or(z.date()),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

const CompletedFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Completed),
  shouldFetch: z.boolean(),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

const FeedItemImportStateSchema = z.discriminatedUnion('status', [
  NewFeedItemImportStateSchema,
  ProcessingFeedItemImportStateSchema,
  FailedFeedItemImportStateSchema,
  CompletedFeedItemImportStateSchema,
]);

export type FeedItemImportStateFromStorage = z.infer<typeof FeedItemImportStateSchema>;

/////////////////////////
//  FEED ITEM CONTENT  //
/////////////////////////
const BaseFeedItemContentSchema = z.object({
  title: z.string(),
});

const FeedItemWithUrlContentSchema = BaseFeedItemContentSchema.extend({
  url: z.string().url(),
  description: z.string().nullable(),
  summary: z.string().nullable(),
  outgoingLinks: z.array(z.string().url()),
});

export type FeedItemWithUrlContentFromStorage = z.infer<typeof FeedItemWithUrlContentSchema>;

const XkcdFeedItemContentSchema = FeedItemWithUrlContentSchema.extend({
  altText: z.string(),
  imageUrlSmall: z.string().url(),
  imageUrlLarge: z.string().url(),
});

export type XkcdFeedItemContentFromStorage = z.infer<typeof XkcdFeedItemContentSchema>;

const IntervalFeedItemContentSchema = BaseFeedItemContentSchema.extend({
  intervalSeconds: z.number(),
});

export type IntervalFeedItemContentFromStorage = z.infer<typeof IntervalFeedItemContentSchema>;

/////////////////
//  FEED ITEM  //
/////////////////
const BaseFeedItemSchema = z.object({
  feedSource: FeedSourceSchema,
  feedItemId: FeedItemIdSchema,
  feedItemContentType: z.nativeEnum(FeedItemContentType),
  accountId: AccountIdSchema,
  importState: FeedItemImportStateSchema,
  triageStatus: z.nativeEnum(TriageStatus),
  content: BaseFeedItemContentSchema,
  tagIds: z.record(z.string(), z.literal(true).optional()),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

const ArticleFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Article),
  content: FeedItemWithUrlContentSchema,
});

export type ArticleFeedItemFromStorage = z.infer<typeof ArticleFeedItemSchema>;

const VideoFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Video),
  content: FeedItemWithUrlContentSchema,
});

export type VideoFeedItemFromStorage = z.infer<typeof VideoFeedItemSchema>;

const WebsiteFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Website),
  content: FeedItemWithUrlContentSchema,
});

export type WebsiteFeedItemFromStorage = z.infer<typeof WebsiteFeedItemSchema>;

const TweetFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Tweet),
  content: FeedItemWithUrlContentSchema,
});

export type TweetFeedItemFromStorage = z.infer<typeof TweetFeedItemSchema>;

const YouTubeFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.YouTube),
  content: FeedItemWithUrlContentSchema,
});

export type YouTubeFeedItemFromStorage = z.infer<typeof YouTubeFeedItemSchema>;

const XkcdFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Xkcd),
  content: XkcdFeedItemContentSchema,
});

export type XkcdFeedItemFromStorage = z.infer<typeof XkcdFeedItemSchema>;

const IntervalFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Interval),
  content: IntervalFeedItemContentSchema,
});

export type IntervalFeedItemFromStorage = z.infer<typeof IntervalFeedItemSchema>;

export const FeedItemSchema = z.union([
  ArticleFeedItemSchema,
  VideoFeedItemSchema,
  WebsiteFeedItemSchema,
  TweetFeedItemSchema,
  YouTubeFeedItemSchema,
  XkcdFeedItemSchema,
  IntervalFeedItemSchema,
]);

export type FeedItemFromStorage = z.infer<typeof FeedItemSchema>;
