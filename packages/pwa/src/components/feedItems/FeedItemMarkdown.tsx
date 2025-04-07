import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {FeedItemImportStatus, type FeedItem} from '@shared/types/feedItems.types';

import {useFeedItemMarkdown} from '@sharedClient/services/feedItems.client';

import {Text} from '@src/components/atoms/Text';
import {Markdown} from '@src/components/Markdown';

export const FeedItemMarkdown: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const markdownState = useFeedItemMarkdown(
    feedItem.feedItemId,
    feedItem.importState.status === FeedItemImportStatus.Completed
  );

  switch (feedItem.importState.status) {
    case FeedItemImportStatus.Failed:
      return <Text as="p">Import failed</Text>;
    case FeedItemImportStatus.Processing:
      return <Text as="p">Import in progress...</Text>;
    case FeedItemImportStatus.New:
      return <Text as="p">Loading markdown...</Text>;
    case FeedItemImportStatus.Completed:
      if (markdownState.error) {
        return <Text as="p">Error loading markdown</Text>;
      } else if (markdownState.isLoading) {
        return <Text as="p">Loading markdown...</Text>;
      } else if (markdownState.markdown) {
        return <Markdown content={markdownState.markdown} />;
      } else {
        return <Text as="p">No markdown</Text>;
      }
    default:
      assertNever(feedItem.importState);
  }
};
