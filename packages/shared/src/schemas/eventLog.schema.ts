import {z} from 'zod';

import {Environment} from '@shared/types/environment.types';
import {EventType} from '@shared/types/eventLog.types';
import {FeedItemActionType} from '@shared/types/feedItems.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {ActorSchema} from '@shared/schemas/actors.schema';
import {FeedItemIdSchema} from '@shared/schemas/feedItems.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';
import {UserFeedSubscriptionIdSchema} from '@shared/schemas/userFeedSubscriptions.schema';

/** Zod schema for an {@link EventId}. */
// TODO: Consider adding `brand()` and defining `EventId` based on this schema.
export const EventIdSchema = z.string().uuid();

export const FeedItemActionEventLogItemDataSchema = z.object({
  feedItemId: FeedItemIdSchema,
  feedItemActionType: z.nativeEnum(FeedItemActionType),
});

export const FeedItemImportedEventLogItemDataSchema = z.object({
  feedItemId: FeedItemIdSchema,
});

export const UserFeedSubscriptionEventLogItemDataSchema = z.object({
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

const EventLogItemDataSchema = FeedItemActionEventLogItemDataSchema.or(
  UserFeedSubscriptionEventLogItemDataSchema
).or(FeedItemImportedEventLogItemDataSchema);

/** Zod schema for an {@link EventLogItem} persisted to Firestore. */
export const EventLogItemFromStorageSchema = z.object({
  eventId: EventIdSchema,
  eventType: z.nativeEnum(EventType),
  accountId: AccountIdSchema,
  actor: ActorSchema,
  environment: z.nativeEnum(Environment),
  data: EventLogItemDataSchema,
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

/** Type for an {@link EventLogItem} persisted to Firestore. */
export type EventLogItemFromStorage = z.infer<typeof EventLogItemFromStorageSchema>;
