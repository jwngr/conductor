import type React from 'react';

import type {ArticleFeedItem} from '@shared/types/feedItems.types';

import {FeedItemSummary, SimpleFeedItemRenderer} from '@src/components/feedItems/FeedItem';
import {FeedItemMarkdown} from '@src/components/feedItems/FeedItemMarkdown';

export const ArticleFeedItemRenderer: React.FC<{readonly feedItem: ArticleFeedItem}> = ({
  feedItem,
}) => {
  return (
    <SimpleFeedItemRenderer feedItem={feedItem}>
      <FeedItemSummary summary={feedItem.content.summary} />
      <FeedItemMarkdown feedItem={feedItem} />
    </SimpleFeedItemRenderer>
  );
};
