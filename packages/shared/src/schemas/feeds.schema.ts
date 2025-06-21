import {z} from 'zod/v4';

import {FeedType} from '@shared/types/feedSourceTypes.types';

import {FeedSubscriptionIdSchema} from '@shared/schemas/feedSubscriptions.schema';

const BaseFeedSchema = z.object({
  feedType: z.enum(FeedType),
});

const RssFeedSchema = BaseFeedSchema.extend({
  feedType: z.literal(FeedType.RSS),
  feedSubscriptionId: FeedSubscriptionIdSchema,
});

export type RssFeedFromStorage = z.infer<typeof RssFeedSchema>;

const YouTubeChannelFeedSchema = BaseFeedSchema.extend({
  feedType: z.literal(FeedType.YouTubeChannel),
  feedSubscriptionId: FeedSubscriptionIdSchema,
});

export type YouTubeChannelFeedFromStorage = z.infer<typeof YouTubeChannelFeedSchema>;

const IntervalFeedSchema = BaseFeedSchema.extend({
  feedType: z.literal(FeedType.Interval),
  feedSubscriptionId: FeedSubscriptionIdSchema,
});

export type IntervalFeedFromStorage = z.infer<typeof IntervalFeedSchema>;

const PwaFeedSchema = BaseFeedSchema.extend({
  feedType: z.literal(FeedType.PWA),
});

const ExtensionFeedSchema = BaseFeedSchema.extend({
  feedType: z.literal(FeedType.Extension),
});

const PocketExportFeedSchema = BaseFeedSchema.extend({
  feedType: z.literal(FeedType.PocketExport),
});

export const FeedSchema = z.discriminatedUnion('feedType', [
  RssFeedSchema,
  YouTubeChannelFeedSchema,
  PwaFeedSchema,
  ExtensionFeedSchema,
  PocketExportFeedSchema,
  IntervalFeedSchema,
]);

export type FeedFromStorage = z.infer<typeof FeedSchema>;
