import type React from 'react';

import type {TweetFeedItem} from '@shared/types/feedItems.types';

import {P} from '@src/components/atoms/Text';
import {SimpleFeedItemRenderer} from '@src/components/feedItems/FeedItem';

export const TweetFeedItemRenderer: React.FC<{readonly feedItem: TweetFeedItem}> = ({feedItem}) => {
  return (
    <SimpleFeedItemRenderer feedItem={feedItem}>
      <P>TODO</P>
    </SimpleFeedItemRenderer>
  );
};
