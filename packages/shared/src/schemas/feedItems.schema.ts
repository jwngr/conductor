import {z} from 'zod/v4';

import {
  FeedItemContentType,
  FeedItemImportStatus,
  TriageStatus,
} from '@shared/types/feedItems.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {FeedSourceSchema} from '@shared/schemas/feedSources.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';

export const FeedItemIdSchema = z.uuid();

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
  url: z.url(),
  description: z.string().nullable(),
  summary: z.string().nullable(),
  outgoingLinks: z.array(z.url()),
});

export type FeedItemWithUrlContentFromStorage = z.infer<typeof FeedItemWithUrlContentSchema>;

const XkcdFeedItemContentSchema = FeedItemWithUrlContentSchema.extend({
  altText: z.string().nullable(),
  imageUrlSmall: z.url().nullable(),
  imageUrlLarge: z.url().nullable(),
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
  feedItemContentType: z.enum(FeedItemContentType),
  accountId: AccountIdSchema,
  importState: FeedItemImportStateSchema,
  triageStatus: z.enum(TriageStatus),
  content: BaseFeedItemContentSchema,
  tagIds: z.record(z.string(), z.literal(true).optional()),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

const FeedItemWithUrlSchema = BaseFeedItemSchema.extend({
  content: FeedItemWithUrlContentSchema,
  feedItemContentType: z.union([
    z.literal(FeedItemContentType.Article),
    z.literal(FeedItemContentType.Video),
    z.literal(FeedItemContentType.Website),
    z.literal(FeedItemContentType.Tweet),
    z.literal(FeedItemContentType.YouTube),
  ]),
});

export type FeedItemWithUrlFromStorage = z.infer<typeof FeedItemWithUrlSchema>;

const ArticleFeedItemSchema = FeedItemWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Article),
  content: FeedItemWithUrlContentSchema,
});

const VideoFeedItemSchema = FeedItemWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Video),
  content: FeedItemWithUrlContentSchema,
});

const WebsiteFeedItemSchema = FeedItemWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Website),
  content: FeedItemWithUrlContentSchema,
});

const TweetFeedItemSchema = FeedItemWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Tweet),
  content: FeedItemWithUrlContentSchema,
});

const YouTubeFeedItemSchema = FeedItemWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.YouTube),
  content: FeedItemWithUrlContentSchema,
});

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
