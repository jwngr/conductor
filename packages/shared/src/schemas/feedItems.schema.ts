import {z} from 'zod';

import {
  FeedItemContentType,
  FeedItemImportStatus,
  TriageStatus,
} from '@shared/types/feedItems.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {
  FeedSourceSchema,
  FeedSourceWithUrlSchema,
  IntervalFeedSourceSchema,
} from '@shared/schemas/feedSources.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';

export const FeedItemIdSchema = z.string().uuid();

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

// Content Data Schemas
const BaseFeedItemContentSchema = z.object({
  feedItemContentType: z.nativeEnum(FeedItemContentType),
  title: z.string(),
});

const BaseFeedItemContentWithUrlSchema = BaseFeedItemContentSchema.extend({
  url: z.string().url(),
  description: z.string().nullable(),
  summary: z.string().nullable(),
  outgoingLinks: z.array(z.string().url()),
});

export type BaseFeedItemContentWithUrlFromStorage = z.infer<
  typeof BaseFeedItemContentWithUrlSchema
>;

const ArticleFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Article),
});

const VideoFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Video),
});

const WebsiteFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Website),
});

const TweetFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Tweet),
});

const YouTubeFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.YouTube),
});

const XkcdFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Xkcd),
  altText: z.string(),
  imageUrlSmall: z.string().url(),
  imageUrlLarge: z.string().url(),
});

export type XkcdFeedItemContentFromStorage = z.infer<typeof XkcdFeedItemContentSchema>;

const IntervalFeedItemContentSchema = BaseFeedItemContentSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Interval),
  intervalSeconds: z.number(),
});

export type IntervalFeedItemContentFromStorage = z.infer<typeof IntervalFeedItemContentSchema>;

export const FeedItemContentSchema = z.discriminatedUnion('feedItemContentType', [
  ArticleFeedItemContentSchema,
  VideoFeedItemContentSchema,
  WebsiteFeedItemContentSchema,
  TweetFeedItemContentSchema,
  YouTubeFeedItemContentSchema,
  XkcdFeedItemContentSchema,
  IntervalFeedItemContentSchema,
]);

export type FeedItemContentFromStorage = z.infer<typeof FeedItemContentSchema>;

const BaseFeedItemSchema = z.object({
  feedSource: FeedSourceSchema,
  feedItemId: FeedItemIdSchema,
  accountId: AccountIdSchema,
  importState: FeedItemImportStateSchema,
  triageStatus: z.nativeEnum(TriageStatus),
  content: BaseFeedItemContentSchema,
  tagIds: z.record(z.string(), z.literal(true).optional()),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

const ArticleFeedItemSchema = BaseFeedItemSchema.extend({
  content: ArticleFeedItemContentSchema,
  feedSource: FeedSourceWithUrlSchema,
});

const VideoFeedItemSchema = BaseFeedItemSchema.extend({
  content: VideoFeedItemContentSchema,
  feedSource: FeedSourceWithUrlSchema,
});

const WebsiteFeedItemSchema = BaseFeedItemSchema.extend({
  content: WebsiteFeedItemContentSchema,
  feedSource: FeedSourceWithUrlSchema,
});

const TweetFeedItemSchema = BaseFeedItemSchema.extend({
  content: TweetFeedItemContentSchema,
  feedSource: FeedSourceWithUrlSchema,
});

const YouTubeFeedItemSchema = BaseFeedItemSchema.extend({
  content: YouTubeFeedItemContentSchema,
  feedSource: FeedSourceWithUrlSchema,
});

export const XkcdFeedItemSchema = BaseFeedItemSchema.extend({
  content: XkcdFeedItemContentSchema,
  feedSource: FeedSourceWithUrlSchema,
});

export type XkcdFeedItemFromStorage = z.infer<typeof XkcdFeedItemSchema>;

export const IntervalFeedItemSchema = BaseFeedItemSchema.extend({
  content: IntervalFeedItemContentSchema,
  feedSource: IntervalFeedSourceSchema,
});

export type IntervalFeedItemFromStorage = z.infer<typeof IntervalFeedItemSchema>;

export const FeedItemSchema = z.union([
  ArticleFeedItemSchema,
  VideoFeedItemSchema,
  WebsiteFeedItemSchema,
  TweetFeedItemSchema,
  YouTubeFeedItemSchema,
  XkcdFeedItemSchema,
]);

export type FeedItemFromStorage = z.infer<typeof FeedItemSchema>;
