import {z} from 'zod/v4';

import {FeedType} from '@shared/types/feedSourceTypes.types';

import {UserFeedSubscriptionIdSchema} from '@shared/schemas/userFeedSubscriptions.schema';

const BaseFeedSchema = z.object({
  feedType: z.enum(FeedType),
});

const RssFeedSchema = BaseFeedSchema.extend({
  feedType: z.literal(FeedType.RSS),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

export type RssFeedFromStorage = z.infer<typeof RssFeedSchema>;

const YouTubeChannelFeedSchema = BaseFeedSchema.extend({
  feedType: z.literal(FeedType.YouTubeChannel),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

export type YouTubeChannelFeedFromStorage = z.infer<typeof YouTubeChannelFeedSchema>;

const IntervalFeedSchema = BaseFeedSchema.extend({
  feedType: z.literal(FeedType.Interval),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
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
