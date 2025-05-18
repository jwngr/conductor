import {z} from 'zod';

import {FeedItemImportStatus, FeedItemType, TriageStatus} from '@shared/types/feedItems.types';
import {FeedSourceSchema} from '@shared/types/feedSources.types';
import {FirestoreTimestampSchema} from '@shared/types/firebase.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';

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
  url: z.string().url(),
  title: z.string(),
  description: z.string().nullable(),
  summary: z.string().nullable(),
  outgoingLinks: z.array(z.string().url()),
  tagIds: z.record(z.string(), z.literal(true).optional()),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

/**
 * Type for a {@link FeedItem} persisted to Firestore.
 */
export type BaseFeedItemFromStorage = z.infer<typeof BaseFeedItemFromStorageSchema>;

/**
 * Zod schema for an {@link XkcdFeedItem} persisted to Firestore.
 */
export const XkcdFeedItemFromStorageSchema = BaseFeedItemFromStorageSchema.extend({
  feedItemType: z.literal(FeedItemType.Xkcd),
  xkcd: z
    .object({
      altText: z.string(),
      imageUrlSmall: z.string().url(),
      imageUrlLarge: z.string().url(),
    })
    .nullable(),
});

/**
 * Type for an {@link XkcdFeedItem} persisted to Firestore.
 */
export type XkcdFeedItemFromStorage = z.infer<typeof XkcdFeedItemFromStorageSchema>;

export type FeedItemFromStorage = BaseFeedItemFromStorage | XkcdFeedItemFromStorage;
