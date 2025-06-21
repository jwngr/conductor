import {z} from 'zod/v4';

import {FeedItemImportStatus} from '@shared/types/feedItemImportStates';

import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';

const NewFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.New),
  shouldFetch: z.literal(true),
  lastSuccessfulImportTime: z.null(),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

const ProcessingFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Processing),
  shouldFetch: z.literal(false),
  importStartedTime: FirestoreTimestampSchema.or(z.date()),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

const FailedFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Failed),
  shouldFetch: z.boolean(),
  errorMessage: z.string(),
  importFailedTime: FirestoreTimestampSchema.or(z.date()),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()).or(z.null()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

const CompletedFeedItemImportStateSchema = z.object({
  status: z.literal(FeedItemImportStatus.Completed),
  shouldFetch: z.boolean(),
  lastSuccessfulImportTime: FirestoreTimestampSchema.or(z.date()),
  lastImportRequestedTime: FirestoreTimestampSchema.or(z.date()),
});

export const FeedItemImportStateSchema = z.discriminatedUnion('status', [
  NewFeedItemImportStateSchema,
  ProcessingFeedItemImportStateSchema,
  FailedFeedItemImportStateSchema,
  CompletedFeedItemImportStateSchema,
]);

export type FeedItemImportStateFromStorage = z.infer<typeof FeedItemImportStateSchema>;
