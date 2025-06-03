import {z} from 'zod';

import {Environment} from '@shared/types/environment.types';
import {EventType} from '@shared/types/eventLog.types';
import {FeedItemActionType} from '@shared/types/feedItems.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {ActorSchema} from '@shared/schemas/actors.schema';
import {ExperimentIdSchema, ExperimentTypeSchema} from '@shared/schemas/experiments.schema';
import {FeedItemIdSchema} from '@shared/schemas/feedItems.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';
import {ThemePreferenceSchema} from '@shared/schemas/theme.schema';
import {UserFeedSubscriptionIdSchema} from '@shared/schemas/userFeedSubscriptions.schema';

/** Zod schema for an {@link EventId}. */
// TODO: Consider adding `brand()` and defining `EventId` based on this schema.
export const EventIdSchema = z.string().uuid();

const BaseEventLogItemDataSchema = z.object({
  eventType: z.nativeEnum(EventType),
});

const FeedItemActionEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.FeedItemAction),
  feedItemId: FeedItemIdSchema,
  feedItemActionType: z.nativeEnum(FeedItemActionType),
});

export type FeedItemActionEventLogItemDataFromStorage = z.infer<
  typeof FeedItemActionEventLogItemDataSchema
>;

const FeedItemImportedEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.FeedItemImported),
  feedItemId: FeedItemIdSchema,
});

export type FeedItemImportedEventLogItemDataFromStorage = z.infer<
  typeof FeedItemImportedEventLogItemDataSchema
>;

const ExperimentEnabledEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.ExperimentEnabled),
  experimentId: ExperimentIdSchema,
  experimentType: ExperimentTypeSchema,
  value: z.string().optional(), // For string experiments, the value that was set
});

export type ExperimentEnabledEventLogItemDataFromStorage = z.infer<
  typeof ExperimentEnabledEventLogItemDataSchema
>;

export type ExperimentDisabledEventLogItemDataFromStorage = z.infer<
  typeof ExperimentDisabledEventLogItemDataSchema
>;

export const ExperimentDisabledEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.ExperimentDisabled),
  experimentId: ExperimentIdSchema,
  experimentType: ExperimentTypeSchema,
});

export type StringExperimentValueChangedEventLogItemDataFromStorage = z.infer<
  typeof StringExperimentValueChangedEventLogItemDataSchema
>;

const StringExperimentValueChangedEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.StringExperimentValueChanged),
  experimentId: ExperimentIdSchema,
  value: z.string(),
});

export type SubscribedToFeedSourceEventLogItemDataFromStorage = z.infer<
  typeof SubscribedToFeedSourceEventLogItemDataSchema
>;

const SubscribedToFeedSourceEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.SubscribedToFeedSource),
  feedSourceType: z.nativeEnum(FeedSourceType),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
  isResubscribe: z.boolean(),
});

export type UnsubscribedFromFeedSourceEventLogItemDataFromStorage = z.infer<
  typeof UnsubscribedFromFeedSourceEventLogItemDataSchema
>;

export const UnsubscribedFromFeedSourceEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.UnsubscribedFromFeedSource),
  feedSourceType: z.nativeEnum(FeedSourceType),
  userFeedSubscriptionId: UserFeedSubscriptionIdSchema,
});

export type ThemePreferenceChangedEventLogItemDataFromStorage = z.infer<
  typeof ThemePreferenceChangedEventLogItemDataSchema
>;

const ThemePreferenceChangedEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.ThemePreferenceChanged),
  themePreference: ThemePreferenceSchema,
});

export const EventLogItemDataSchema = z.discriminatedUnion('eventType', [
  FeedItemActionEventLogItemDataSchema,
  FeedItemImportedEventLogItemDataSchema,
  ExperimentEnabledEventLogItemDataSchema,
  ExperimentDisabledEventLogItemDataSchema,
  StringExperimentValueChangedEventLogItemDataSchema,
  SubscribedToFeedSourceEventLogItemDataSchema,
  UnsubscribedFromFeedSourceEventLogItemDataSchema,
  ThemePreferenceChangedEventLogItemDataSchema,
]);

/** Zod schema for an {@link EventLogItem} persisted to Firestore. */
export const EventLogItemSchema = z.object({
  eventId: EventIdSchema,
  accountId: AccountIdSchema,
  actor: ActorSchema,
  environment: z.nativeEnum(Environment),
  data: EventLogItemDataSchema,
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

/** Type for an {@link EventLogItem} persisted to Firestore. */
export type EventLogItemFromStorage = z.infer<typeof EventLogItemSchema>;
