import {z} from 'zod/v4';

import {FEED_TYPES_WITH_SUBSCRIPTIONS, FeedType} from '@shared/types/feeds.types';
import {FeedSubscriptionActivityStatus} from '@shared/types/feedSubscriptions.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {DeliveryScheduleSchema} from '@shared/schemas/deliverySchedules.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';
import {YouTubeChannelIdSchema} from '@shared/schemas/youtube.schema';

export const FeedSubscriptionIdSchema = z.uuid();

const FeedSubscriptionActivityStatusSchema = z.enum(FeedSubscriptionActivityStatus);

const BaseFeedSubscriptionLifecycleSchema = z.object({
  status: FeedSubscriptionActivityStatusSchema,
});

const ActiveFeedSubscriptionLifecycleSchema = BaseFeedSubscriptionLifecycleSchema.extend({
  status: z.literal(FeedSubscriptionActivityStatus.Active),
});

const InactiveFeedSubscriptionLifecycleSchema = BaseFeedSubscriptionLifecycleSchema.extend({
  status: z.literal(FeedSubscriptionActivityStatus.Inactive),
  unsubscribedTime: FirestoreTimestampSchema.or(z.date()),
});

export const FeedSubscriptionLifecycleSchema = z.discriminatedUnion('status', [
  ActiveFeedSubscriptionLifecycleSchema,
  InactiveFeedSubscriptionLifecycleSchema,
]);

export type FeedSubscriptionLifecycleStateFromStorage = z.infer<
  typeof FeedSubscriptionLifecycleSchema
>;

const BaseFeedSubscriptionSchema = z.object({
  feedType: z.enum(FEED_TYPES_WITH_SUBSCRIPTIONS),
  feedSubscriptionId: FeedSubscriptionIdSchema,
  accountId: AccountIdSchema,
  deliverySchedule: DeliveryScheduleSchema,
  lifecycleState: FeedSubscriptionLifecycleSchema,
  // TODO: These should not need to be nullable.
  createdTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
});

const RssFeedSubscriptionSchema = BaseFeedSubscriptionSchema.extend({
  feedType: z.literal(FeedType.RSS),
  url: z.url(),
  title: z.string(),
});

export type RssFeedSubscriptionFromStorage = z.infer<typeof RssFeedSubscriptionSchema>;

const YouTubeChannelFeedSubscriptionSchema = BaseFeedSubscriptionSchema.extend({
  feedType: z.literal(FeedType.YouTubeChannel),
  channelId: YouTubeChannelIdSchema,
});

export type YouTubeChannelFeedSubscriptionFromStorage = z.infer<
  typeof YouTubeChannelFeedSubscriptionSchema
>;

const IntervalFeedSubscriptionSchema = BaseFeedSubscriptionSchema.extend({
  feedType: z.literal(FeedType.Interval),
  intervalSeconds: z.number().positive().int(),
});

export type IntervalFeedSubscriptionFromStorage = z.infer<typeof IntervalFeedSubscriptionSchema>;

export const FeedSubscriptionSchema = z.discriminatedUnion('feedType', [
  RssFeedSubscriptionSchema,
  YouTubeChannelFeedSubscriptionSchema,
  IntervalFeedSubscriptionSchema,
]);

/**
 * Type for a {@link FeedSubscription} persisted to Firestore.
 */
export type FeedSubscriptionFromStorage = z.infer<typeof FeedSubscriptionSchema>;
