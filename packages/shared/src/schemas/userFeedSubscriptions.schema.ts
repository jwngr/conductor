import {z} from 'zod';

import {FeedSourceType, PERSISTED_FEED_SOURCE_TYPES} from '@shared/types/feedSourceTypes.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {DeliveryScheduleFromStorageSchema} from '@shared/schemas/deliverySchedules.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';
import {YouTubeChannelIdSchema} from '@shared/schemas/youtube.schema';

/**
 * Zod schema for a {@link UserFeedSubscriptionId}.
 */
export const UserFeedSubscriptionIdSchema = z.string().uuid();

/**
 * Zod schema for a {@link UserFeedSubscription} persisted to Firestore.
 */
const BaseUserFeedSubscriptionFromStorageSchema = z.object({
  feedSourceType: z.enum(PERSISTED_FEED_SOURCE_TYPES),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  accountId: AccountIdSchema,
  isActive: z.boolean(),
  deliverySchedule: DeliveryScheduleFromStorageSchema,
  unsubscribedTime: FirestoreTimestampSchema.or(z.date()).optional(),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

export const RssUserFeedSubscriptionFromStorageSchema =
  BaseUserFeedSubscriptionFromStorageSchema.extend({
    feedSourceType: z.literal(FeedSourceType.RSS),
    url: z.string().url(),
    title: z.string(),
  });

export const YouTubeChannelUserFeedSubscriptionFromStorageSchema =
  BaseUserFeedSubscriptionFromStorageSchema.extend({
    feedSourceType: z.literal(FeedSourceType.YouTubeChannel),
    channelId: YouTubeChannelIdSchema,
  });

export const IntervalUserFeedSubscriptionFromStorageSchema =
  BaseUserFeedSubscriptionFromStorageSchema.extend({
    feedSourceType: z.literal(FeedSourceType.Interval),
    intervalSeconds: z.number().positive().int().min(60),
  });

export const UserFeedSubscriptionFromStorageSchema = z.discriminatedUnion('feedSourceType', [
  RssUserFeedSubscriptionFromStorageSchema,
  YouTubeChannelUserFeedSubscriptionFromStorageSchema,
  IntervalUserFeedSubscriptionFromStorageSchema,
]);

/**
 * Type for a {@link UserFeedSubscription} persisted to Firestore.
 */
export type UserFeedSubscriptionFromStorage = z.infer<typeof UserFeedSubscriptionFromStorageSchema>;
