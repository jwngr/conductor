import React from 'react';

import {ArticleFeedItem} from '@shared/types/feedItems';

import {FeedItemHeader, FeedItemWrapper} from './FeedItem';
import {FeedItemMarkdown} from './FeedItemMarkdown';

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
