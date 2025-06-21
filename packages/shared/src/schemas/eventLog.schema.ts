import {z} from 'zod/v4';

import {Environment} from '@shared/types/environment.types';
import {EventType} from '@shared/types/eventLog.types';
import {FeedItemActionType} from '@shared/types/feedItems.types';
import {FeedType} from '@shared/types/feeds.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {ActorSchema} from '@shared/schemas/actors.schema';
import {ExperimentIdSchema, ExperimentTypeSchema} from '@shared/schemas/experiments.schema';
import {FeedItemIdSchema} from '@shared/schemas/feedItems.schema';
import {FeedSubscriptionIdSchema} from '@shared/schemas/feedSubscriptions.schema';
import {ThemePreferenceSchema} from '@shared/schemas/theme.schema';
import {BaseStoreItemSchema} from '@shared/schemas/utils.schema';

// TODO: Consider adding `brand()` and defining `EventId` based on this schema.
export const EventIdSchema = z.uuid();

const BaseEventLogItemDataSchema = z.object({
  eventType: z.enum(EventType),
});

const FeedItemActionEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.FeedItemAction),
  feedItemId: FeedItemIdSchema,
  feedItemActionType: z.enum(FeedItemActionType),
  isUndo: z.boolean(),
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

export const ExperimentDisabledEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.ExperimentDisabled),
  experimentId: ExperimentIdSchema,
  experimentType: ExperimentTypeSchema,
});

const StringExperimentValueChangedEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.StringExperimentValueChanged),
  experimentId: ExperimentIdSchema,
  value: z.string(),
});

const SubscribedToFeedEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.SubscribedToFeed),
  feedType: z.enum(FeedType),
  feedSubscriptionId: FeedSubscriptionIdSchema,
  isNewSubscription: z.boolean(),
});

export type SubscribedToFeedEventLogItemDataFromStorage = z.infer<
  typeof SubscribedToFeedEventLogItemDataSchema
>;

export const UnsubscribedFromFeedEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.UnsubscribedFromFeed),
  feedType: z.enum(FeedType),
  feedSubscriptionId: FeedSubscriptionIdSchema,
});

export type UnsubscribedFromFeedEventLogItemDataFromStorage = z.infer<
  typeof UnsubscribedFromFeedEventLogItemDataSchema
>;

const ThemePreferenceChangedEventLogItemDataSchema = BaseEventLogItemDataSchema.extend({
  eventType: z.literal(EventType.ThemePreferenceChanged),
  themePreference: ThemePreferenceSchema,
});

const EventLogItemDataSchema = z.discriminatedUnion('eventType', [
  FeedItemActionEventLogItemDataSchema,
  FeedItemImportedEventLogItemDataSchema,
  ExperimentEnabledEventLogItemDataSchema,
  ExperimentDisabledEventLogItemDataSchema,
  StringExperimentValueChangedEventLogItemDataSchema,
  SubscribedToFeedEventLogItemDataSchema,
  UnsubscribedFromFeedEventLogItemDataSchema,
  ThemePreferenceChangedEventLogItemDataSchema,
]);

/** Type for an {@link EventLogItemData} persisted to Firestore. */
export type EventLogItemDataFromStorage = z.infer<typeof EventLogItemDataSchema>;

export const EventLogItemSchema = BaseStoreItemSchema.extend({
  eventId: EventIdSchema,
  accountId: AccountIdSchema,
  actor: ActorSchema,
  environment: z.enum(Environment),
  data: EventLogItemDataSchema,
});

/** Type for an {@link EventLogItem} persisted to Firestore. */
export type EventLogItemFromStorage = z.infer<typeof EventLogItemSchema>;
