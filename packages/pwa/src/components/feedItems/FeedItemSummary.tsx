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
      const msSinceImportRequested =
        Date.now() - feedItem.importState.lastImportRequestedTime.getTime();
      const secondsSinceImportRequested = parseFloat((msSinceImportRequested / 1000).toFixed(0));
      return (
        <Text as="p">
          Import requested {secondsSinceImportRequested} seconds ago and still in progress...
        </Text>
      );
    }
    case FeedItemImportStatus.New: {
      const msSinceCreated = Date.now() - feedItem.createdTime.getTime();
      const secondsSinceCreated = parseFloat((msSinceCreated / 1000).toFixed(0));
      return (
        <Text as="p">
          Import not yet started, item created {secondsSinceCreated} seconds ago...
        </Text>
      );
    }
    case FeedItemImportStatus.Completed:
      if (feedItem.summary) {
        return <Markdown content={feedItem.summary.replace(/•/g, '*')} />;
      } else {
        return <Text as="p">No summary</Text>;
      }
    default: {
      assertNever(feedItem.importState);
    }
  }
};
