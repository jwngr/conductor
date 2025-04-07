import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {FeedItemImportStatus, type FeedItem} from '@shared/types/feedItems.types';

import {useFeedItemMarkdown} from '@sharedClient/services/feedItems.client';

import {Text} from '@src/components/atoms/Text';
import {Markdown} from '@src/components/Markdown';

export const FeedItemMarkdown: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const hasFeedItemEverBeenImported = feedItem.importState.lastSuccessfulImportTime !== null;

  const markdownState = useFeedItemMarkdown({
    feedItemId: feedItem.feedItemId,
    hasFeedItemEverBeenImported,
  });

  if (hasFeedItemEverBeenImported) {
    if (markdownState.error) {
      return (
        <Text as="p" className="text-error">
          Error loading markdown: {markdownState.error.message}
        </Text>
      );
    } else if (markdownState.isLoading) {
      return <Text as="p">Loading markdown...</Text>;
    } else if (markdownState.markdown) {
      return <Markdown content={markdownState.markdown} />;
    } else {
      return <Text as="p">No markdown</Text>;
    }
  }

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
    default: {
      assertNever(feedItem.importState);
    }
  }
};
