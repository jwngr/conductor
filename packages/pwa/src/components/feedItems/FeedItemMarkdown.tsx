import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {FeedItemImportStatus, type FeedItem} from '@shared/types/feedItems.types';

import {useFeedItemMarkdown} from '@sharedClient/services/feedItems.client';

import {Text} from '@src/components/atoms/Text';
import {Markdown} from '@src/components/Markdown';

export const FeedItemMarkdown: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const markdownState = useFeedItemMarkdown({
    feedItemId: feedItem.feedItemId,
    hasFeedItemEverBeenImported: feedItem.importState.hasEverBeenImported,
  });

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
        <Text as="p">Import in progress... {secondsSinceImportStarted} seconds since started</Text>
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
    default:
      assertNever(feedItem.importState);
  }
};
