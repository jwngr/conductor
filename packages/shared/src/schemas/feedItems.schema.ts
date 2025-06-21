import {z} from 'zod/v4';

import {FeedItemContentType} from '@shared/types/feedItemContent.types';
import {TriageStatus} from '@shared/types/feedItems.types';

import {
  ArticleFeedItemContentSchema,
  IntervalFeedItemContentSchema,
  TweetFeedItemContentSchema,
  VideoFeedItemContentSchema,
  WebsiteFeedItemContentSchema,
  XkcdFeedItemContentSchema,
  YouTubeFeedItemContentSchema,
} from '@shared/schemas/feedItemContent.schema';
import {FeedItemImportStateSchema} from '@shared/schemas/feedItemImportStates.schema';
import {FeedSchema} from '@shared/schemas/feeds.schema';
import {AccountIdSchema, FeedItemIdSchema} from '@shared/schemas/ids.schema';
import {BaseStoreItemSchema} from '@shared/schemas/utils.schema';

const BaseFeedItemSchema = BaseStoreItemSchema.extend({
  origin: FeedSchema,
  feedItemId: FeedItemIdSchema,
  feedItemContentType: z.enum(FeedItemContentType),
  accountId: AccountIdSchema,
  importState: FeedItemImportStateSchema,
  triageStatus: z.enum(TriageStatus),
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
