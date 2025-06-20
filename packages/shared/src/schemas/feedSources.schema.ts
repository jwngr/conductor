import {z} from 'zod/v4';

import {FeedType} from '@shared/types/feedSourceTypes.types';

import {UserFeedSubscriptionIdSchema} from '@shared/schemas/userFeedSubscriptions.schema';

const BaseFeedSourceSchema = z.object({
  feedType: z.enum(FeedType),
});

const RssFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedType: z.literal(FeedType.RSS),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

export type RssFeedSourceFromStorage = z.infer<typeof RssFeedSourceSchema>;

const YouTubeChannelFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedType: z.literal(FeedType.YouTubeChannel),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

export type YouTubeChannelFeedSourceFromStorage = z.infer<typeof YouTubeChannelFeedSourceSchema>;

const IntervalFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedType: z.literal(FeedType.Interval),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

export type IntervalFeedSourceFromStorage = z.infer<typeof IntervalFeedSourceSchema>;

const PwaFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedType: z.literal(FeedType.PWA),
});

const ExtensionFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedType: z.literal(FeedType.Extension),
});

const PocketExportFeedSourceSchema = BaseFeedSourceSchema.extend({
  feedType: z.literal(FeedType.PocketExport),
});

export const FeedSourceSchema = z.discriminatedUnion('feedType', [
  RssFeedSourceSchema,
  YouTubeChannelFeedSourceSchema,
  PwaFeedSourceSchema,
  ExtensionFeedSourceSchema,
  PocketExportFeedSourceSchema,
  IntervalFeedSourceSchema,
]);

export type FeedSourceFromStorage = z.infer<typeof FeedSourceSchema>;
