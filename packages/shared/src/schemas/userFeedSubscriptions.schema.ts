import {z} from 'zod/v4';

import {FEED_TYPES_WITH_SUBSCRIPTIONS, FeedType} from '@shared/types/feedSourceTypes.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {DeliveryScheduleSchema} from '@shared/schemas/deliverySchedules.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';
import {YouTubeChannelIdSchema} from '@shared/schemas/youtube.schema';

export const UserFeedSubscriptionIdSchema = z.uuid();

const BaseUserFeedSubscriptionSchema = z.object({
  feedType: z.enum(FEED_TYPES_WITH_SUBSCRIPTIONS),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  accountId: AccountIdSchema,
  isActive: z.boolean(),
  deliverySchedule: DeliveryScheduleSchema,
  unsubscribedTime: FirestoreTimestampSchema.or(z.date()).optional(),
  // TODO: These should not need to be nullable.
  createdTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
});

const RssUserFeedSubscriptionSchema = BaseUserFeedSubscriptionSchema.extend({
  feedType: z.literal(FeedType.RSS),
  url: z.url(),
  title: z.string(),
});

export type RssUserFeedSubscriptionFromStorage = z.infer<typeof RssUserFeedSubscriptionSchema>;

const YouTubeChannelUserFeedSubscriptionSchema = BaseUserFeedSubscriptionSchema.extend({
  feedType: z.literal(FeedType.YouTubeChannel),
  channelId: YouTubeChannelIdSchema,
});

export type YouTubeChannelUserFeedSubscriptionFromStorage = z.infer<
  typeof YouTubeChannelUserFeedSubscriptionSchema
>;

const IntervalUserFeedSubscriptionSchema = BaseUserFeedSubscriptionSchema.extend({
  feedType: z.literal(FeedType.Interval),
  intervalSeconds: z.number().positive().int(),
});

export type IntervalUserFeedSubscriptionFromStorage = z.infer<
  typeof IntervalUserFeedSubscriptionSchema
>;

export const UserFeedSubscriptionSchema = z.discriminatedUnion('feedType', [
  RssUserFeedSubscriptionSchema,
  YouTubeChannelUserFeedSubscriptionSchema,
  IntervalUserFeedSubscriptionSchema,
]);

/**
 * Type for a {@link UserFeedSubscription} persisted to Firestore.
 */
export type UserFeedSubscriptionFromStorage = z.infer<typeof UserFeedSubscriptionSchema>;
