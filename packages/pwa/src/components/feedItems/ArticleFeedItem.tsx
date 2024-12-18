import React from 'react';

import {ArticleFeedItem} from '@shared/types/feedItems.types';

import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {FeedItemMarkdown} from '@src/components/feedItems/FeedItemMarkdown';

export const ArticleFeedItemComponent: React.FC<{readonly feedItem: ArticleFeedItem}> = ({
  feedItem,
}) => {
  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      <pre>{JSON.stringify(feedItem, null, 2)}</pre>
      <br />
      <FeedItemMarkdown feedItem={feedItem} />
    </FeedItemWrapper>
  );
};
