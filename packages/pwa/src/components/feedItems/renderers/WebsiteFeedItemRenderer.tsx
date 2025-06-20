import type React from 'react';

import type {WebsiteFeedItem} from '@shared/types/feedItems.types';

import {FeedItemSummary, SimpleFeedItemRenderer} from '@src/components/feedItems/FeedItem';
import {FeedItemMarkdown} from '@src/components/feedItems/FeedItemMarkdown';

export const WebsiteFeedItemRenderer: React.FC<{readonly feedItem: WebsiteFeedItem}> = ({
  feedItem,
}) => {
  return (
    <SimpleFeedItemRenderer feedItem={feedItem}>
      <FeedItemSummary summary={feedItem.content.summary} />
      <FeedItemMarkdown feedItem={feedItem} />
    </SimpleFeedItemRenderer>
  );
};
