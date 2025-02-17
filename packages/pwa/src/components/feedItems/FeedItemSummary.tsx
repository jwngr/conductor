import type React from 'react';

import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';

import type {FeedItem} from '@shared/types/feedItems.types';

import {Text} from '@src/components/atoms/Text';
import {Markdown} from '@src/components/Markdown';

export const FeedItemSummary: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const isFeedItemImported = !SharedFeedItemHelpers.isImporting(feedItem);
  if (!isFeedItemImported) {
    return <Text as="p">Importing...</Text>;
  } else if (feedItem.summary) {
    return <Markdown content={feedItem.summary.replace(/•/g, '*')} />;
  } else {
    return <Text as="p">No summary</Text>;
  }
};
