import {z} from 'zod';

import {FeedSourceType, PERSISTED_FEED_SOURCE_TYPES} from '@shared/types/feedSourceTypes.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {DeliveryScheduleSchema} from '@shared/schemas/deliverySchedules.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';
import {YouTubeChannelIdSchema} from '@shared/schemas/youtube.schema';

/**
 * Zod schema for a {@link UserFeedSubscriptionId}.
 */
export const UserFeedSubscriptionIdSchema = z.string().uuid();

/**
 * Zod schema for a {@link UserFeedSubscription} persisted to Firestore.
 */
const BaseUserFeedSubscriptionSchema = z.object({
  feedSourceType: z.enum(PERSISTED_FEED_SOURCE_TYPES),
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
  feedSourceType: z.literal(FeedSourceType.RSS),
  url: z.string().url(),
  title: z.string(),
});

export type RssUserFeedSubscriptionFromStorage = z.infer<typeof RssUserFeedSubscriptionSchema>;

const YouTubeChannelUserFeedSubscriptionSchema = BaseUserFeedSubscriptionSchema.extend({
  feedSourceType: z.literal(FeedSourceType.YouTubeChannel),
  channelId: YouTubeChannelIdSchema,
});

export type YouTubeChannelUserFeedSubscriptionFromStorage = z.infer<
  typeof YouTubeChannelUserFeedSubscriptionSchema
>;

const IntervalUserFeedSubscriptionSchema = BaseUserFeedSubscriptionSchema.extend({
  feedSourceType: z.literal(FeedSourceType.Interval),
  intervalSeconds: z.number().positive().int(),
});

export type IntervalUserFeedSubscriptionFromStorage = z.infer<
  typeof IntervalUserFeedSubscriptionSchema
>;

export const UserFeedSubscriptionSchema = z.discriminatedUnion('feedSourceType', [
  RssUserFeedSubscriptionSchema,
  YouTubeChannelUserFeedSubscriptionSchema,
  IntervalUserFeedSubscriptionSchema,
]);

/**
 * Type for a {@link UserFeedSubscription} persisted to Firestore.
 */
export type UserFeedSubscriptionFromStorage = z.infer<typeof UserFeedSubscriptionSchema>;
