import type React from 'react';

import type {ArticleFeedItem} from '@shared/types/feedItems.types';

import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {FeedItemMarkdown} from '@src/components/feedItems/FeedItemMarkdown';
import {FeedItemSummary} from '@src/components/feedItems/FeedItemSummary';

export const ArticleFeedItemComponent: React.FC<{readonly feedItem: ArticleFeedItem}> = ({
  feedItem,
}) => {
  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      <FeedItemSummary feedItem={feedItem} />
      <FeedItemMarkdown feedItem={feedItem} />
    </FeedItemWrapper>
  );
};
