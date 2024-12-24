import React from 'react';

import type {TweetFeedItem} from '@shared/types/feedItems.types';

import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {FeedItemMarkdown} from '@src/components/feedItems/FeedItemMarkdown';

export const TweetFeedItemComponent: React.FC<{readonly feedItem: TweetFeedItem}> = ({
  feedItem,
}) => {
  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      <FeedItemMarkdown feedItem={feedItem} />
    </FeedItemWrapper>
  );
};
