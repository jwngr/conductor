import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {FeedItemImportStatus, type FeedItem} from '@shared/types/feedItems.types';

import {Text} from '@src/components/atoms/Text';
import {Markdown} from '@src/components/Markdown';

export const FeedItemSummary: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  switch (feedItem.importState.status) {
    case FeedItemImportStatus.Failed:
      return (
        <Text as="p" className="text-error">
          Import failed: {feedItem.importState.errorMessage}
        </Text>
      );
    case FeedItemImportStatus.Processing: {
      const msSinceImportStarted = Date.now() - feedItem.importState.importStartedTime.getTime();
      const secondsSinceImportStarted = msSinceImportStarted / 1000;
      return (
        <Text as="p">
          Import started {secondsSinceImportStarted} seconds ago and still in progres...
        </Text>
      );
    }
    case FeedItemImportStatus.New: {
      const msSinceCreated = Date.now() - feedItem.createdTime.getTime();
      const secondsSinceCreated = msSinceCreated / 1000;
      return (
        <Text as="p">Import not yet started... {secondsSinceCreated} seconds since created</Text>
      );
    }
    case FeedItemImportStatus.Completed:
    case FeedItemImportStatus.NeedsRefresh: {
      if (feedItem.summary) {
        return <Markdown content={feedItem.summary.replace(/•/g, '*')} />;
      } else {
        return <Text as="p">No summary</Text>;
      }
    }
    default: {
      assertNever(feedItem.importState);
    }
  }
};
