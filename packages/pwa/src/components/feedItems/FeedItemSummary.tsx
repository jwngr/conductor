import type React from 'react';

import type {FeedItem} from '@shared/types/feedItems.types';

import {Text} from '@src/components/atoms/Text';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';
import {Markdown} from '@src/components/Markdown';

export const FeedItemSummary: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const hasFeedItemEverBeenImported = feedItem.importState.lastSuccessfulImportTime !== null;

  if (hasFeedItemEverBeenImported) {
    if (feedItem.summary) {
      return <Markdown content={feedItem.summary.replace(/•/g, '*')} />;
    } else {
      return <Text as="p">No summary</Text>;
    }
  }

  return <ImportingFeedItem feedItem={feedItem} />;
};
