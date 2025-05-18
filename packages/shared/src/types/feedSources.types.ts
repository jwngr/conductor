import {z} from 'zod';

import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';
import {UserFeedSubscriptionIdSchema} from '@shared/types/userFeedSubscriptions.types';
import {YouTubeChannelIdSchema} from '@shared/types/youtube.types';
import type {YouTubeChannelId} from '@shared/types/youtube.types';

interface BaseFeedSource {
  readonly feedSourceType: FeedSourceType;
}

export interface RssFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.RSS;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly url: string;
  readonly title: string;
}

export interface YouTubeChannelFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.YouTubeChannel;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly channelId: YouTubeChannelId;
}

export interface IntervalFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.Interval;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}

export interface PwaFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.PWA;
}

export interface ExtensionFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.Extension;
}

export interface PocketExportFeedSource extends BaseFeedSource {
  readonly feedSourceType: FeedSourceType.PocketExport;
}

export type FeedSource =
  | RssFeedSource
  | YouTubeChannelFeedSource
  | IntervalFeedSource
  | PwaFeedSource
  | ExtensionFeedSource
  | PocketExportFeedSource;

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
