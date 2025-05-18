import {z} from 'zod';

import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import {YouTubeChannelIdSchema} from '@shared/types/youtube.types';

import {UserFeedSubscriptionIdSchema} from '@shared/schemas/userFeedSubscriptions.schema';

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
