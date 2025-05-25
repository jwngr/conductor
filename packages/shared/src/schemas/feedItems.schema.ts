import {z} from 'zod';

import {FeedItemImportStatus, FeedItemType, TriageStatus} from '@shared/types/feedItems.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {FeedSourceSchema, FeedSourceWithUrlSchema} from '@shared/schemas/feedSources.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';

/**
 * Zod schema for a {@link FeedItemId}.
 */
export const FeedItemIdSchema = z.string().uuid();

export const NewFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.New),
  shouldFetch: z.literal(true),
  lastSuccessfulImportTime: z.null(),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

export const ProcessingFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Processing),
  shouldFetch: z.literal(false),
  importStartedTime: FirestoreTimestampSchema.or(z.date()),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

export const FailedFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Failed),
  shouldFetch: z.boolean(),
  errorMessage: z.string(),
  importFailedTime: FirestoreTimestampSchema.or(z.date()),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

export const CompletedFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Completed),
  shouldFetch: z.boolean(),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

const FeedItemImportStateFromStorageSchema = z.discriminatedUnion('status', [
  NewFeedItemImportStateSchema,
  ProcessingFeedItemImportStateSchema,
  FailedFeedItemImportStateSchema,
  CompletedFeedItemImportStateSchema,
]);

export type FeedItemImportStateFromStorage = z.infer<typeof FeedItemImportStateFromStorageSchema>;

/**
 * Zod schema for a {@link FeedItem} persisted to Firestore.
 */
export const BaseFeedItemFromStorageSchema = z.object({
  feedItemType: z.nativeEnum(FeedItemType),
  feedSource: FeedSourceSchema,
  feedItemId: FeedItemIdSchema,
  accountId: AccountIdSchema,
  importState: FeedItemImportStateFromStorageSchema,
  triageStatus: z.nativeEnum(TriageStatus),
  title: z.string(),
  tagIds: z.record(z.string(), z.literal(true).optional()),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

export type BaseFeedItemFromStorage = z.infer<typeof BaseFeedItemFromStorageSchema>;

export const BaseFeedItemWithUrlFromStorageSchema = BaseFeedItemFromStorageSchema.extend({
  url: z.string().url(),
  description: z.string().nullable(),
  summary: z.string().nullable(),
  outgoingLinks: z.array(z.string().url()),
  feedSource: FeedSourceWithUrlSchema,
});

export type BaseFeedItemWithUrlFromStorage = z.infer<typeof BaseFeedItemWithUrlFromStorageSchema>;

export const XkcdFeedItemFromStorageSchema = BaseFeedItemWithUrlFromStorageSchema.extend({
  feedItemType: z.literal(FeedItemType.Xkcd),
  xkcd: z
    .object({
      altText: z.string(),
      imageUrlSmall: z.string().url(),
      imageUrlLarge: z.string().url(),
    })
    .nullable(),
});

export type XkcdFeedItemFromStorage = z.infer<typeof XkcdFeedItemFromStorageSchema>;

export const IntervalFeedItemFromStorageSchema = BaseFeedItemFromStorageSchema.extend({
  feedItemType: z.literal(FeedItemType.Interval),
});

export type IntervalFeedItemFromStorage = z.infer<typeof IntervalFeedItemFromStorageSchema>;

export type FeedItemFromStorage =
  | BaseFeedItemWithUrlFromStorage
  | XkcdFeedItemFromStorage
  | IntervalFeedItemFromStorage;
