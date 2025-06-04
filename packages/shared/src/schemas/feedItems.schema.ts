import {z} from 'zod';

import {FeedItemImportStatus, FeedItemType, TriageStatus} from '@shared/types/feedItems.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {
  FeedSourceSchema,
  FeedSourceWithUrlSchema,
  IntervalFeedSourceSchema,
} from '@shared/schemas/feedSources.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';

export const FeedItemIdSchema = z.string().uuid();

const NewFeedItemImportStateSchema = z.object({
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

const FeedItemImportStateSchema = z.discriminatedUnion('status', [
  NewFeedItemImportStateSchema,
  ProcessingFeedItemImportStateSchema,
  FailedFeedItemImportStateSchema,
  CompletedFeedItemImportStateSchema,
]);

export type FeedItemImportStateFromStorage = z.infer<typeof FeedItemImportStateSchema>;

const BaseFeedItemSchema = z.object({
  feedItemType: z.nativeEnum(FeedItemType),
  feedSource: FeedSourceSchema,
  feedItemId: FeedItemIdSchema,
  accountId: AccountIdSchema,
  importState: FeedItemImportStateSchema,
  triageStatus: z.nativeEnum(TriageStatus),
  title: z.string(),
  tagIds: z.record(z.string(), z.literal(true).optional()),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

export const BaseFeedItemWithUrlSchema = BaseFeedItemSchema.extend({
  url: z.string().url(),
  description: z.string().nullable(),
  summary: z.string().nullable(),
  outgoingLinks: z.array(z.string().url()),
  feedSource: FeedSourceWithUrlSchema,
});

export type BaseFeedItemWithUrlFromStorage = z.infer<typeof BaseFeedItemWithUrlSchema>;

export const XkcdFeedItemSchema = BaseFeedItemWithUrlSchema.extend({
  feedItemType: z.literal(FeedItemType.Xkcd),
  xkcd: z
    .object({
      altText: z.string(),
      imageUrlSmall: z.string().url(),
      imageUrlLarge: z.string().url(),
    })
    .nullable(),
});

export type XkcdFeedItemFromStorage = z.infer<typeof XkcdFeedItemSchema>;

export const IntervalFeedItemSchema = BaseFeedItemSchema.extend({
  feedItemType: z.literal(FeedItemType.Interval),
  feedSource: IntervalFeedSourceSchema,
});

export type IntervalFeedItemFromStorage = z.infer<typeof IntervalFeedItemSchema>;

export const FeedItemSchema = z.discriminatedUnion('feedItemType', [
  BaseFeedItemWithUrlSchema,
  XkcdFeedItemSchema,
  IntervalFeedItemSchema,
]);

export type FeedItemFromStorage = z.infer<typeof FeedItemSchema>;
