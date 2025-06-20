import {z} from 'zod/v4';

import {FeedItemContentType} from '@shared/types/feedItemContent.types';

export const FeedItemIdSchema = z.uuid();

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

export const ArticleFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Article),
});

export type ArticleFeedItemContentFromStorage = z.infer<typeof ArticleFeedItemContentSchema>;

export const VideoFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Video),
});

export type VideoFeedItemContentFromStorage = z.infer<typeof VideoFeedItemContentSchema>;

export const WebsiteFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Website),
});

export type WebsiteFeedItemContentFromStorage = z.infer<typeof WebsiteFeedItemContentSchema>;

export const TweetFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Tweet),
});

export type TweetFeedItemContentFromStorage = z.infer<typeof TweetFeedItemContentSchema>;

export const YouTubeFeedItemContentSchema = BaseFeedItemContentWithUrlSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.YouTube),
});

export type YouTubeFeedItemContentFromStorage = z.infer<typeof YouTubeFeedItemContentSchema>;

export const XkcdFeedItemContentSchema = BaseFeedItemContentSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Xkcd),
  url: z.url(),
  summary: z.string().nullable(),
  altText: z.string(),
  imageUrlSmall: z.url(),
  imageUrlLarge: z.url(),
});

export type XkcdFeedItemContentFromStorage = z.infer<typeof XkcdFeedItemContentSchema>;

export const IntervalFeedItemContentSchema = BaseFeedItemContentSchema.extend({
  feedItemContentType: z.literal(FeedItemContentType.Interval),
  intervalSeconds: z.number(),
});

export type IntervalFeedItemContentFromStorage = z.infer<typeof IntervalFeedItemContentSchema>;
