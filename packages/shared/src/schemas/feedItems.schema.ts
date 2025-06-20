import {z} from 'zod/v4';

import {
  FeedItemContentType,
  FeedItemImportStatus,
  TriageStatus,
} from '@shared/types/feedItems.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {FeedSchema} from '@shared/schemas/feeds.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';
import {BaseStoreItemSchema} from '@shared/schemas/utils.schema';

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
  feedItemContentType: z.enum(FeedItemContentType),
  title: z.string(),
});

const BaseFeedItemContentWithUrlSchema = BaseFeedItemContentSchema.extend({
  feedItemContentType: z.union([
    z.literal(FeedItemContentType.Article),
    z.literal(FeedItemContentType.Video),
    z.literal(FeedItemContentType.Website),
    z.literal(FeedItemContentType.Tweet),
    z.literal(FeedItemContentType.YouTube),
  ]),
  url: z.url(),
  description: z.string().nullable(),
  summary: z.string().nullable(),
  outgoingLinks: z.array(z.url()),
});

const ArticleFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Article),
});

export type ArticleFeedItemContentFromStorage = z.infer<typeof ArticleFeedItemContentSchema>;

const VideoFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Video),
});

export type VideoFeedItemContentFromStorage = z.infer<typeof VideoFeedItemContentSchema>;

const WebsiteFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Website),
});

export type WebsiteFeedItemContentFromStorage = z.infer<typeof WebsiteFeedItemContentSchema>;

const TweetFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Tweet),
});

export type TweetFeedItemContentFromStorage = z.infer<typeof TweetFeedItemContentSchema>;

const YouTubeFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.YouTube),
});

export type YouTubeFeedItemContentFromStorage = z.infer<typeof YouTubeFeedItemContentSchema>;

const XkcdFeedItemContentSchema = BaseFeedItemContentSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Xkcd),
  url: z.url(),
  summary: z.string().nullable(),
  altText: z.string(),
  imageUrlSmall: z.url(),
  imageUrlLarge: z.url(),
});

export type XkcdFeedItemContentFromStorage = z.infer<typeof XkcdFeedItemContentSchema>;

const IntervalFeedItemContentSchema = BaseFeedItemContentSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Interval),
  intervalSeconds: z.number(),
});

export type IntervalFeedItemContentFromStorage = z.infer<typeof IntervalFeedItemContentSchema>;

/////////////////
//  FEED ITEM  //
/////////////////
const BaseFeedItemSchema = BaseStoreItemSchema.extend({
  origin: FeedSchema,
  feedItemId: FeedItemIdSchema,
  feedItemContentType: z.enum(FeedItemContentType),
  accountId: AccountIdSchema,
  importState: FeedItemImportStateSchema,
  triageStatus: z.enum(TriageStatus),
  content: BaseFeedItemContentSchema,
  tagIds: z.record(z.string(), z.literal(true).optional()),
});

const ArticleFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Article),
  content: ArticleFeedItemContentSchema,
});

export type ArticleFeedItemFromStorage = z.infer<typeof ArticleFeedItemSchema>;

const VideoFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Video),
  content: VideoFeedItemContentSchema,
});

export type VideoFeedItemFromStorage = z.infer<typeof VideoFeedItemSchema>;

const WebsiteFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Website),
  content: WebsiteFeedItemContentSchema,
});

export type WebsiteFeedItemFromStorage = z.infer<typeof WebsiteFeedItemSchema>;

const TweetFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Tweet),
  content: TweetFeedItemContentSchema,
});

export type TweetFeedItemFromStorage = z.infer<typeof TweetFeedItemSchema>;

const YouTubeFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.YouTube),
  content: YouTubeFeedItemContentSchema,
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
