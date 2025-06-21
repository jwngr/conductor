import {assertNever} from '@shared/lib/utils.shared';

import type {
  CompletedFeedItemImportState,
  FailedFeedItemImportState,
  FeedItemImportState,
  NewFeedItemImportState,
  ProcessingFeedItemImportState,
} from '@shared/types/feedItemImportStates';
import {FeedItemImportStatus} from '@shared/types/feedItemImportStates';

export function makeNewFeedItemImportState(args: {
  readonly lastImportRequestedTime?: NewFeedItemImportState['lastImportRequestedTime'];
}): NewFeedItemImportState {
  const {lastImportRequestedTime = new Date()} = args;
  return {
    status: FeedItemImportStatus.New,
    lastImportRequestedTime,
    // New items need to be fetched to get the content.
    shouldFetch: true,
    // New items cannot have a successful import time yet.
    lastSuccessfulImportTime: null,
  };
}

export function makeProcessingFeedItemImportState(args: {
  readonly importStartedTime: ProcessingFeedItemImportState['importStartedTime'];
  readonly lastImportRequestedTime: ProcessingFeedItemImportState['lastImportRequestedTime'];
  readonly lastSuccessfulImportTime: ProcessingFeedItemImportState['lastSuccessfulImportTime'];
}): ProcessingFeedItemImportState {
  const {importStartedTime, lastImportRequestedTime, lastSuccessfulImportTime} = args;
  return {
    status: FeedItemImportStatus.Processing,
    importStartedTime,
    lastImportRequestedTime,
    lastSuccessfulImportTime,
    // Claiming the item means we don't need to fetch it again.
    shouldFetch: false,
  };
}

export function makeFailedFeedItemImportState(args: {
  readonly errorMessage: FailedFeedItemImportState['errorMessage'];
  readonly importFailedTime: FailedFeedItemImportState['importFailedTime'];
  readonly lastImportRequestedTime: FailedFeedItemImportState['lastImportRequestedTime'];
  readonly lastSuccessfulImportTime: FailedFeedItemImportState['lastSuccessfulImportTime'];
}): FailedFeedItemImportState {
  const {errorMessage, lastImportRequestedTime, lastSuccessfulImportTime, importFailedTime} = args;
  return {
    status: FeedItemImportStatus.Failed,
    errorMessage,
    importFailedTime,
    lastImportRequestedTime,
    lastSuccessfulImportTime,
    // Failed items don't need to be fetched again.
    shouldFetch: false,
  };
}

export function makeCompletedFeedItemImportState(args: {
  readonly lastImportRequestedTime: CompletedFeedItemImportState['lastImportRequestedTime'];
  readonly lastSuccessfulImportTime: CompletedFeedItemImportState['lastSuccessfulImportTime'];
}): CompletedFeedItemImportState {
  const {lastImportRequestedTime, lastSuccessfulImportTime} = args;
  return {
    status: FeedItemImportStatus.Completed,
    lastImportRequestedTime,
    lastSuccessfulImportTime,
    // Completed items don't need to be fetched again.
    shouldFetch: false,
  };
}

export function isFeedItemImportStateRetryable(importState: FeedItemImportState): boolean {
  switch (importState.status) {
    case FeedItemImportStatus.Failed:
    case FeedItemImportStatus.New:
    case FeedItemImportStatus.Completed:
      return true;
    case FeedItemImportStatus.Processing:
      return false;
    default:
      assertNever(importState);
  }
}
