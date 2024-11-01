import React from 'react';

import {TweetFeedItem} from '@shared/types/feedItems';

import {FeedItemHeader, FeedItemWrapper} from './FeedItem';
import {FeedItemMarkdown} from './FeedItemMarkdown';

export const TweetFeedItemComponent: React.FC<{readonly feedItem: TweetFeedItem}> = ({
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
