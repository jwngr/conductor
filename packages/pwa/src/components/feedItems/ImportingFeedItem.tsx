import type React from 'react';

import {logger} from '@shared/services/logger.shared';

import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import {FeedItemImportStatus} from '@shared/types/feedItems.types';

import {P} from '@src/components/atoms/Text';

export const ImportingFeedItem: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const hasFeedItemEverBeenImported = SharedFeedItemHelpers.hasEverBeenImported(feedItem);

  if (hasFeedItemEverBeenImported) {
    const error = new Error('Feed item unexpectedly has already been imported');
    logger.error(error, {feedItemId: feedItem.feedItemId});
    return null;
  }

  switch (feedItem.importState.status) {
    case FeedItemImportStatus.Failed:
      return <P className="text-error">Import failed: {feedItem.importState.errorMessage}</P>;

    case FeedItemImportStatus.Processing: {
      const msSinceImportRequested =
        Date.now() - feedItem.importState.lastImportRequestedTime.getTime();
      const secondsSinceImportRequested = parseFloat((msSinceImportRequested / 1000).toFixed(0));
      return (
        <P>Import requested {secondsSinceImportRequested} seconds ago and still in progress...</P>
      );
    }

    case FeedItemImportStatus.New: {
      const msSinceCreated = Date.now() - feedItem.createdTime.getTime();
      const secondsSinceCreated = parseFloat((msSinceCreated / 1000).toFixed(0));
      return <P>Import not yet started, item created {secondsSinceCreated} seconds ago...</P>;
    }
    case FeedItemImportStatus.Completed:
      // This should never happen, but the type system doesn't know that.
      logger.error(new Error('Feed item unexpectedly has completed import'), {
        feedItemId: feedItem.feedItemId,
      });
      return null;

    default:
      assertNever(feedItem.importState);
  }
};
