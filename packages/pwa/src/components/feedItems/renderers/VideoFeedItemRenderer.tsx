import type React from 'react';

import type {VideoFeedItem} from '@shared/types/feedItems.types';

import {P} from '@src/components/atoms/Text';
import {SimpleFeedItemRenderer} from '@src/components/feedItems/FeedItem';

export const VideoFeedItemRenderer: React.FC<{readonly feedItem: VideoFeedItem}> = ({feedItem}) => {
  return (
    <SimpleFeedItemRenderer feedItem={feedItem}>
      <P>TODO</P>
    </SimpleFeedItemRenderer>
  );
};
