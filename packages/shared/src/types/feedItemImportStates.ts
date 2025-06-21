export enum FeedItemImportStatus {
  /** Created but not yet processed. */
  New = 'NEW',
  /** Currently being processed. */
  Processing = 'PROCESSING',
  /** Errored while processing. May have partially imported data. */
  Failed = 'FAILED',
  /** Successfully imported all data. */
  Completed = 'COMPLETED',
}

interface BaseFeedItemImportState {
  readonly status: FeedItemImportStatus;
  readonly shouldFetch: boolean;
  readonly lastImportRequestedTime: Date;
  readonly lastSuccessfulImportTime: Date | null;
}

export interface NewFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.New;
  readonly shouldFetch: true;
  readonly lastSuccessfulImportTime: null;
}

interface ProcessingFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.Processing;
  readonly shouldFetch: false;
  readonly importStartedTime: Date;
  readonly lastSuccessfulImportTime: Date | null;
}

interface FailedFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.Failed;
  readonly shouldFetch: boolean;
  readonly errorMessage: string;
  readonly importFailedTime: Date;
  readonly lastSuccessfulImportTime: Date | null;
}

interface CompletedFeedItemImportState extends BaseFeedItemImportState {
  readonly status: FeedItemImportStatus.Completed;
  readonly shouldFetch: boolean;
  readonly lastSuccessfulImportTime: Date;
}

export type FeedItemImportState =
  | NewFeedItemImportState
  | ProcessingFeedItemImportState
  | FailedFeedItemImportState
  | CompletedFeedItemImportState;
